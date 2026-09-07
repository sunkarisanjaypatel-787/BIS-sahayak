import React from "react";

/**
 * A deliberately small markdown renderer scoped to what BIS Sahayak responses
 * actually use: headings, bold/code spans, bullet + numbered lists, simple
 * pipe tables, and inline citation markers like [1] that become clickable
 * badges wired to the evidence panel.
 */
export function renderMarkdown(
  content: string,
  onCitationClick?: (index: number) => void
): React.ReactNode {
  const blocks = content.replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <>
      {blocks.map((block, i) => (
        <React.Fragment key={i}>{renderBlock(block, i, onCitationClick)}</React.Fragment>
      ))}
    </>
  );
}

function renderBlock(
  block: string,
  key: number,
  onCitationClick?: (index: number) => void
): React.ReactNode {
  const lines = block.split("\n").filter((l) => l.length > 0);
  if (lines.length === 0) return null;

  // Heading
  const headingMatch = lines[0].match(/^(#{1,4})\s+(.*)$/);
  if (headingMatch && lines.length === 1) {
    const level = headingMatch[1].length;
    const text = headingMatch[2];
    const sizes: Record<number, string> = {
      1: "text-lg font-semibold",
      2: "text-base font-semibold",
      3: "text-[15px] font-semibold",
      4: "text-sm font-semibold",
    };
    return (
      <p className={`${sizes[level] || sizes[4]} text-bis-darkblue mt-1 mb-1`}>
        {parseInline(text, onCitationClick)}
      </p>
    );
  }

  // Table (pipe-delimited, with a separator row like |---|---|)
  if (lines.length >= 2 && lines[0].includes("|") && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[1])) {
    const parseRow = (row: string) =>
      row
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((c) => c.trim());

    const header = parseRow(lines[0]);
    const bodyRows = lines.slice(2).map(parseRow);

    return (
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              {header.map((h, i) => (
                <th key={i}>{parseInline(h, onCitationClick)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{parseInline(cell, onCitationClick)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Unordered list
  if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
    return (
      <ul>
        {lines.map((l, i) => (
          <li key={i}>{parseInline(l.replace(/^\s*[-*]\s+/, ""), onCitationClick)}</li>
        ))}
      </ul>
    );
  }

  // Ordered list
  if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
    return (
      <ol>
        {lines.map((l, i) => (
          <li key={i}>{parseInline(l.replace(/^\s*\d+[.)]\s+/, ""), onCitationClick)}</li>
        ))}
      </ol>
    );
  }

  // Default: paragraph (join wrapped lines with a space)
  return <p>{parseInline(lines.join(" "), onCitationClick)}</p>;
}

/**
 * Handles inline **bold**, `code`, and [n] citation markers within a line.
 */
function parseInline(text: string, onCitationClick?: (index: number) => void): React.ReactNode {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\d+\])/g).filter((t) => t.length > 0);

  return tokens.map((token, i) => {
    const boldMatch = token.match(/^\*\*([^*]+)\*\*$/);
    if (boldMatch) {
      return <strong key={i}>{boldMatch[1]}</strong>;
    }

    const codeMatch = token.match(/^`([^`]+)`$/);
    if (codeMatch) {
      return <code key={i}>{codeMatch[1]}</code>;
    }

    const citationMatch = token.match(/^\[(\d+)\]$/);
    if (citationMatch) {
      const idx = parseInt(citationMatch[1], 10);
      return (
        <button
          key={i}
          type="button"
          onClick={() => onCitationClick?.(idx)}
          className="inline-flex items-center justify-center min-w-[1.15rem] h-[1.15rem] mx-0.5 rounded bg-bis-blue/10 text-bis-blue text-[11px] font-semibold align-middle hover:bg-bis-blue hover:text-white transition-colors"
          aria-label={`View source ${idx} in the evidence panel`}
        >
          {idx}
        </button>
      );
    }

    return <React.Fragment key={i}>{token}</React.Fragment>;
  });
}
