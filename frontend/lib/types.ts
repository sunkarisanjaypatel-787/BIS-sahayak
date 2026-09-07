export type PersonaMode = "consumer" | "industry";

export type ConnectionState = "connected" | "connecting" | "offline";

export interface Citation {
  index: number;
  standard: string;
  clause?: string;
  table?: string;
  source?: string;
  snippet?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: Citation[];
  isStreaming?: boolean;
}

export interface Evidence {
  standard: string;
  category?: string;
  clause?: string;
  table?: string;
  source: string;
  snippet: string;
  relevance?: number;
  [key: string]: any;
}

export type EvidenceState = "empty" | "loading" | "success" | "error";

export interface QueryRequest {
  prompt: string;
  mode: PersonaMode;
}

export interface QueryResponsePayload {
  content?: string;
  answer?: string;
  delta?: string;
  citations?: Citation[];
  evidence?: Evidence[];
  sources?: Evidence[];
  hits?: Evidence[];
  done?: boolean;
}
