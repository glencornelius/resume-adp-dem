import { sanitizeSequence } from "@/lib/adp-dem/properties";

export interface ParsedSequenceRow {
  id: string;
  sequence: string;
  source: "csv" | "fasta" | "txt";
}

export function parseSequenceInput(text: string): ParsedSequenceRow[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  if (trimmed.includes(",") && /sequence/i.test(trimmed.split(/\r?\n/)[0])) {
    const lines = trimmed.split(/\r?\n/).filter(Boolean);
    const header = lines[0].split(",").map((x) => x.trim().toLowerCase());
    const idIndex = header.indexOf("id");
    const seqIndex = header.indexOf("sequence");
    if (seqIndex >= 0) {
      return lines.slice(1).map((line, index) => {
        const cols = line.split(",").map((x) => x.trim());
        return {
          id: cols[idIndex] || `row_${index + 1}`,
          sequence: sanitizeSequence(cols[seqIndex] || ""),
          source: "csv" as const
        };
      });
    }
  }

  if (trimmed.includes(">")) {
    const lines = trimmed.split(/\r?\n/);
    const rows: ParsedSequenceRow[] = [];
    let currentId = "";
    let buffer = "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (line.startsWith(">")) {
        if (buffer) {
          rows.push({
            id: currentId || `seq_${rows.length + 1}`,
            sequence: sanitizeSequence(buffer),
            source: "fasta"
          });
        }
        currentId = line.replace(/^>/, "").trim();
        buffer = "";
      } else {
        buffer += line;
      }
    }

    if (buffer) {
      rows.push({
        id: currentId || `seq_${rows.length + 1}`,
        sequence: sanitizeSequence(buffer),
        source: "fasta"
      });
    }

    return rows;
  }

  return trimmed
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => ({
      id: `line_${index + 1}`,
      sequence: sanitizeSequence(line),
      source: "txt" as const
    }));
}
