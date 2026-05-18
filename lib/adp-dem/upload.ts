import { parseSequenceInput } from "@/lib/adp-dem/parsers";
import { validateSequence } from "@/lib/adp-dem/properties";

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_BATCH_SEQUENCES = 1000;

const allowedExtensions = new Set(["fa", "fasta", "txt", "csv"]);

export interface InvalidSequenceRow {
  id: string;
  sequence: string;
  reason: string;
}

export interface UploadValidationResult {
  ok: boolean;
  sequences: Array<{ id: string; sequence: string }>;
  errors: string[];
  invalidRows: InvalidSequenceRow[];
}

export function validateUploadFile(file: File): string[] {
  const errors: string[] = [];
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (!allowedExtensions.has(extension)) {
    errors.push("文件类型不支持，请上传 FASTA、CSV 或 TXT 文件。");
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    errors.push(`文件大小超过限制，请上传不超过 ${(MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(0)}MB 的文件。`);
  }

  return errors;
}

export function validateSequenceRows(text: string, maxRows = MAX_BATCH_SEQUENCES): UploadValidationResult {
  const parsed = parseSequenceInput(text);
  const errors: string[] = [];
  const invalidRows: InvalidSequenceRow[] = [];
  const sequences: Array<{ id: string; sequence: string }> = [];

  if (parsed.length === 0) {
    errors.push("未识别到序列，请检查 FASTA、CSV 或纯文本格式。");
  }

  if (parsed.length > maxRows) {
    errors.push(`序列数量超过限制，最多支持 ${maxRows} 条。`);
  }

  for (const row of parsed.slice(0, maxRows)) {
    const checked = validateSequence(row.sequence);
    if (!checked.valid) {
      invalidRows.push({
        id: row.id,
        sequence: row.sequence,
        reason: checked.errors.join("；")
      });
    } else {
      sequences.push({ id: row.id, sequence: checked.sequence });
    }
  }

  return {
    ok: errors.length === 0 && invalidRows.length === 0,
    sequences,
    errors,
    invalidRows
  };
}
