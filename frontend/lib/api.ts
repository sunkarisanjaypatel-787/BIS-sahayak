import type { Citation, Evidence, PersonaMode, QueryResponsePayload } from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Checks whether the FastAPI orchestrator is reachable.
 * Used to drive the header's connection status indicator.
 */
export async function checkOrchestratorHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, {
      method: "GET",
      signal,
      cache: "no-store",
    }).catch(() =>
      // Fall back to hitting the root/query endpoint pre-flight if /health
      // is not implemented by the orchestrator.
      fetch(`${API_URL}/`, { method: "GET", signal, cache: "no-store" })
    );
    return !!res && res.ok;
  } catch {
    return false;
  }
}

/**
 * Non-streaming fallback: sends the prompt and waits for the full JSON response.
 * Prefer streamAssistantResponse for the primary chat experience.
 */
export async function queryAssistant(
  prompt: string,
  mode: PersonaMode
): Promise<{ content: string; citations?: Citation[]; evidence?: Evidence[] }> {
  const res = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, mode }),
  });

  if (!res.ok) {
    throw new ApiError(`Orchestrator responded with ${res.status}`, res.status);
  }

  const data = await res.json();
  const rawEvidence = data.evidence || data.sources || data.hits || [];

  return {
    content: data.content ?? data.answer ?? "",
    citations: normalizeCitations(data.citations),
    evidence: normalizeEvidence(rawEvidence),
  };
}

interface StreamCallbacks {
  onToken: (delta: string) => void;
  onCitations?: (citations: Citation[]) => void;
  onEvidence?: (evidence: Evidence[]) => void;
  onError?: (error: ApiError) => void;
  onDone?: () => void;
}

/**
 * Opens a streaming connection to POST /query and progressively parses the
 * text/event-stream response, invoking callbacks as chunks arrive.
 *
 * Supports two wire formats transparently:
 *  - SSE frames: lines beginning with "data: {...}"
 *  - raw newline-delimited JSON or plain text chunks
 */
export async function streamAssistantResponse(
  prompt: string,
  mode: PersonaMode,
  callbacks: StreamCallbacks,
  signal?: AbortSignal
): Promise<void> {
  const { onToken, onCitations, onEvidence, onError, onDone } = callbacks;

  const isolatedPrompt = prompt.trim();
  const activePersona = mode || "consumer";

  let res: Response;
  try {
    res = await fetch(`${API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({
        prompt: isolatedPrompt,
        mode: activePersona,
      }),
      signal,
    });
  } catch (err) {
    onError?.(new ApiError("Unable to reach the BIS orchestrator. Is it running on " + API_URL + "?"));
    return;
  }

  if (!res.ok) {
    onError?.(new ApiError(`Orchestrator responded with ${res.status}`, res.status));
    return;
  }

  if (!res.body) {
    // No streaming body available; fall back to reading the full text.
    const text = await res.text();
    consumeChunk(text, { onToken, onCitations, onEvidence });
    onDone?.();
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let currentEvent = "";

  const processDataLine = (dataStr: string) => {
    if (!dataStr || dataStr === "[DONE]") return;

    if (currentEvent === "sources") {
      try {
        const parsed = JSON.parse(dataStr);
        const sources = Array.isArray(parsed)
          ? parsed
          : parsed.sources || parsed.evidence || [parsed];
        onEvidence?.(normalizeEvidence(sources));
      } catch (err) {
        console.error("Failed to parse SSE sources payload:", err);
      }
      return;
    }

    // Check if dataStr is an array payload without explicit event: sources
    if (dataStr.startsWith("[") && dataStr.endsWith("]")) {
      try {
        const parsed = JSON.parse(dataStr);
        if (Array.isArray(parsed)) {
          onEvidence?.(normalizeEvidence(parsed));
          return;
        }
      } catch {}
    }

    // Check if dataStr is structured JSON object
    if (dataStr.startsWith("{") && dataStr.endsWith("}")) {
      try {
        const parsed: QueryResponsePayload = JSON.parse(dataStr);
        if (parsed.delta) onToken(parsed.delta);
        else if (parsed.content) onToken(parsed.content);
        else if (parsed.answer) onToken(parsed.answer);
        else if ((parsed as any).response) onToken((parsed as any).response);
        else if ((parsed as any).token) onToken((parsed as any).token);
        else onToken(dataStr);

        if (parsed.citations?.length) onCitations?.(normalizeCitations(parsed.citations));

        const rawEvidence = parsed.evidence || parsed.sources || parsed.hits;
        if (rawEvidence?.length) onEvidence?.(normalizeEvidence(rawEvidence));
        return;
      } catch {
        onToken(dataStr);
        return;
      }
    }

    // Standard string token stream
    onToken(dataStr);
  };

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete lines; keep the trailing partial line in the buffer.
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        const line = rawLine.replace(/\r$/, "");
        if (line === "") {
          // Empty line indicates end of an SSE message block
          currentEvent = "";
          continue;
        }

        if (line.startsWith("event:")) {
          currentEvent = line.slice(6).trim();
          continue;
        }

        if (line.startsWith("data:")) {
          const dataStr = line.startsWith("data: ") ? line.slice(6) : line.slice(5);
          processDataLine(dataStr);
          continue;
        }

        if (line.startsWith("id:") || line.startsWith(":")) {
          // SSE identifier or comment line
          continue;
        }

        // Non-SSE raw line fallback
        consumeChunk(line, { onToken, onCitations, onEvidence });
      }
    }

    if (buffer.trim()) {
      const line = buffer.replace(/\r$/, "");
      if (line.startsWith("data:")) {
        const dataStr = line.startsWith("data: ") ? line.slice(6) : line.slice(5);
        processDataLine(dataStr);
      } else if (!line.startsWith("event:") && !line.startsWith("id:") && !line.startsWith(":")) {
        consumeChunk(line, { onToken, onCitations, onEvidence });
      }
    }

    onDone?.();
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    onError?.(new ApiError("The connection to the orchestrator was interrupted."));
  }
}

function consumeChunk(
  chunk: string,
  cb: {
    onToken: (delta: string) => void;
    onCitations?: (c: Citation[]) => void;
    onEvidence?: (e: Evidence[]) => void;
  }
) {
  if (!chunk) return;

  // Try to parse as JSON first (structured streaming payload).
  try {
    const parsed: any = JSON.parse(chunk);
    if (Array.isArray(parsed)) {
      cb.onEvidence?.(normalizeEvidence(parsed));
      return;
    }
    if (parsed.delta) cb.onToken(parsed.delta);
    else if (parsed.content) cb.onToken(parsed.content);
    else if (parsed.answer) cb.onToken(parsed.answer);
    else if (parsed.response) cb.onToken(parsed.response);

    if (parsed.citations?.length) cb.onCitations?.(normalizeCitations(parsed.citations));

    const rawEvidence = parsed.evidence || parsed.sources || parsed.hits;
    if (rawEvidence?.length) cb.onEvidence?.(normalizeEvidence(rawEvidence));
    return;
  } catch {
    // Not JSON — treat the chunk as a raw text token.
    cb.onToken(chunk);
  }
}

export function normalizeEvidence(raw: any[] | undefined): Evidence[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, idx) => {
    const standard =
      item.standard ||
      item.standard_name ||
      item.standard_code ||
      item.is_number ||
      item.standard_title ||
      "IS Standard";

    const category =
      item.category ||
      item.domain ||
      item.section ||
      item.type ||
      "Standard Specification";

    const clause =
      item.clause ||
      item.clause_identifier ||
      item.clause_id ||
      item.clause_no ||
      item.clause_number ||
      item.section_id ||
      item.table ||
      "General Requirements";

    const source =
      item.source ||
      item.document ||
      item.file_name ||
      item.doc_name ||
      item.title ||
      standard;

    const snippet =
      item.snippet ||
      item.text ||
      item.content ||
      item.chunk_text ||
      item.excerpt ||
      "";

    const relevance =
      typeof item.relevance === "number"
        ? item.relevance
        : typeof item.score === "number"
        ? item.score
        : typeof item.similarity === "number"
        ? item.similarity
        : undefined;

    return {
      standard,
      category,
      clause,
      table: item.table,
      source,
      snippet,
      relevance,
      ...item,
    };
  });
}

function normalizeCitations(citations: any[] | undefined): Citation[] {
  if (!citations) return [];
  return citations.map((c, i) => ({
    index: c.index ?? i + 1,
    standard: c.standard ?? "Unknown Standard",
    clause: c.clause,
    table: c.table,
    source: c.source,
    snippet: c.snippet,
  }));
}
