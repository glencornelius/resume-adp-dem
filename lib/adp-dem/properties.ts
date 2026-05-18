import { SequenceProperties } from "@/lib/adp-dem/types";

export const VALID_AMINO_ACIDS = "ACDEFGHIKLMNPQRSTVWY";
const validSet = new Set(VALID_AMINO_ACIDS.split(""));
const hydrophobicSet = new Set(["A", "V", "I", "L", "M", "F", "W", "Y"]);
const polarSet = new Set(["S", "T", "N", "Q", "C", "Y", "G"]);
const aromaticSet = new Set(["F", "W", "Y"]);
const positiveSet = new Set(["K", "R", "H"]);
const negativeSet = new Set(["D", "E"]);

export function sanitizeSequence(input: string): string {
  return input.replace(/\s+/g, "").toUpperCase();
}

export function validateSequence(input: string): { valid: boolean; sequence: string; errors: string[] } {
  const sequence = sanitizeSequence(input);
  const errors: string[] = [];

  if (!sequence) {
    errors.push("序列为空，请输入至少 1 个氨基酸字符。");
  }

  const invalidChars = [...sequence].filter((ch) => !validSet.has(ch));
  if (invalidChars.length > 0) {
    errors.push(`存在非法字符：${Array.from(new Set(invalidChars)).join(" ")}。仅支持 ${VALID_AMINO_ACIDS}`);
  }

  return {
    valid: errors.length === 0,
    sequence,
    errors
  };
}

export function toLengthType(length: number): SequenceProperties["lengthType"] {
  if (length < 5 || length > 60) return "out";
  if (length <= 8) return "short";
  if (length <= 15) return "mid";
  return "long";
}

export function computeSequenceProperties(sequence: string): SequenceProperties {
  const counts: Record<string, number> = {};
  for (const aa of VALID_AMINO_ACIDS) counts[aa] = 0;

  for (const aa of sequence) {
    if (counts[aa] !== undefined) counts[aa] += 1;
  }

  const length = sequence.length;
  const hydrophobic = [...sequence].filter((aa) => hydrophobicSet.has(aa)).length;
  const polar = [...sequence].filter((aa) => polarSet.has(aa)).length;
  const aromatic = [...sequence].filter((aa) => aromaticSet.has(aa)).length;
  const positiveChargeCount = [...sequence].filter((aa) => positiveSet.has(aa)).length;
  const negativeChargeCount = [...sequence].filter((aa) => negativeSet.has(aa)).length;

  const ratio = (value: number) => (length ? Number((value / length).toFixed(4)) : 0);

  return {
    length,
    lengthType: toLengthType(length),
    aminoAcidCounts: counts,
    hydrophobicRatio: ratio(hydrophobic),
    polarRatio: ratio(polar),
    aromaticRatio: ratio(aromatic),
    positiveChargeCount,
    negativeChargeCount,
    netCharge: positiveChargeCount - negativeChargeCount
  };
}

export function getPropertySummary(properties: SequenceProperties): string {
  const hydroLabel = properties.hydrophobicRatio >= 0.45 ? "较高" : properties.hydrophobicRatio >= 0.28 ? "中等" : "较低";
  const chargeLabel = properties.netCharge > 1 ? "偏正电" : properties.netCharge < -1 ? "偏负电" : "电荷相对平衡";
  return `长度 ${properties.length} aa（${properties.lengthType}），疏水比例${hydroLabel}（${(properties.hydrophobicRatio * 100).toFixed(1)}%），${chargeLabel}。`;
}
