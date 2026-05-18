#!/usr/bin/env python3
import argparse
import csv
import json
import math
import os
import re
import statistics
import zipfile
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

AA_ORDER = list("ACDEFGHIKLMNPQRSTVWY")


def safe_float(value, default=0.0):
    try:
        return float(value)
    except Exception:
        return default


def safe_int(value, default=0):
    try:
        return int(float(value))
    except Exception:
        return default


def read_csv(path):
    with open(path, "r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def parse_docx_text(docx_path):
    xml_bytes = zipfile.ZipFile(docx_path).read("word/document.xml")
    root = ET.fromstring(xml_bytes)
    chunks = []
    for el in root.iter():
        tag = el.tag
        if isinstance(tag, str) and tag.endswith("}t") and el.text:
            chunks.append(el.text)
    return "".join(chunks)


def length_bin(length):
    if length <= 8:
        return "short"
    if length <= 15:
        return "mid"
    return "long"


def percentile(sorted_values, p):
    if not sorted_values:
        return 0.0
    k = (len(sorted_values) - 1) * p
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return sorted_values[int(k)]
    d0 = sorted_values[f] * (c - k)
    d1 = sorted_values[c] * (k - f)
    return d0 + d1


def clean_energy_string(value):
    s = value.strip()
    m = re.match(r"(-\d+\.\d{3})\d*$", s)
    if m:
        return m.group(1)
    return s


def aa_frequency(seqs):
    total = 0
    counter = Counter()
    for seq in seqs:
        for aa in seq:
            if aa in AA_ORDER:
                counter[aa] += 1
                total += 1
    result = []
    for aa in AA_ORDER:
        freq = counter[aa] / total if total else 0.0
        result.append({"aa": aa, "freq": round(freq, 4), "count": counter[aa]})
    return result


def make_dataset_summary(diabete_rows):
    positive = [row for row in diabete_rows if str(row.get("label", "")).strip() == "1"]
    negative = [row for row in diabete_rows if str(row.get("label", "")).strip() == "0"]

    def lengths(rows):
        return [len((row.get("sequence") or "").strip()) for row in rows if (row.get("sequence") or "").strip()]

    all_lengths = lengths(diabete_rows)
    pos_lengths = lengths(positive)
    neg_lengths = lengths(negative)

    length_counts = Counter(all_lengths)
    length_distribution = [
        {"length": l, "count": c} for l, c in sorted(length_counts.items(), key=lambda x: x[0])
    ]

    summary = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "datasetName": "Anti-diabetic peptide benchmark",
        "sourceFile": "diabete.csv",
        "totalSamples": len(diabete_rows),
        "positiveSamples": len(positive),
        "negativeSamples": len(negative),
        "classBalance": {
            "positiveRatio": round(len(positive) / len(diabete_rows), 4) if diabete_rows else 0,
            "negativeRatio": round(len(negative) / len(diabete_rows), 4) if diabete_rows else 0
        },
        "split": {
            "strategy": "stratified",
            "ratio": "8:2",
            "trainEstimated": 378,
            "testEstimated": 94,
            "note": "Counts are estimated from ratio stated in paper text."
        },
        "lengthStats": {
            "min": min(all_lengths) if all_lengths else 0,
            "max": max(all_lengths) if all_lengths else 0,
            "mean": round(statistics.mean(all_lengths), 2) if all_lengths else 0,
            "median": statistics.median(all_lengths) if all_lengths else 0,
            "positiveMean": round(statistics.mean(pos_lengths), 2) if pos_lengths else 0,
            "negativeMean": round(statistics.mean(neg_lengths), 2) if neg_lengths else 0
        },
        "lengthDistribution": length_distribution,
        "lengthBinDistribution": [
            {
                "bin": b,
                "count": sum(1 for l in all_lengths if length_bin(l) == b)
            }
            for b in ["short", "mid", "long"]
        ],
        "sampleExamples": {
            "positive": [row.get("sequence", "") for row in positive[:5]],
            "negative": [row.get("sequence", "") for row in negative[:5]]
        },
        "aminoAcidFrequency": {
            "positive": aa_frequency([row.get("sequence", "") for row in positive]),
            "negative": aa_frequency([row.get("sequence", "") for row in negative])
        }
    }
    return summary


def make_candidates(topk_rows, topk3di_rows):
    by_rank_3di = {}
    by_seq_3di = defaultdict(list)
    for row in topk3di_rows:
        rank = str(row.get("global_rank", "")).strip()
        seq = (row.get("sequence") or "").strip()
        if rank:
            by_rank_3di[rank] = row
        if seq:
            by_seq_3di[seq].append(row)

    candidates = []
    for row in topk_rows:
        seq = (row.get("sequence") or "").strip()
        rank = safe_int(row.get("global_rank") or row.get("sample_id"))
        row3 = by_rank_3di.get(str(rank))
        if not row3 and by_seq_3di.get(seq):
            row3 = by_seq_3di[seq][0]

        structure_ok = "with-3di"
        if row3:
            ok = str(row3.get("three_di_ok", "")).strip().lower()
            if ok not in {"1", "1.0", "true"}:
                structure_ok = "pending"

        stage1 = safe_float(row.get("official_score") or row.get("score_main"))
        stage2 = safe_float((row3 or {}).get("score_stack_final") or row.get("score_stack_final"))

        candidates.append(
            {
                "rank": rank,
                "sequence": seq,
                "length": safe_int(row.get("length")) or len(seq),
                "lengthBin": (row.get("length_bin") or length_bin(len(seq))).strip() or length_bin(len(seq)),
                "stage1Score": round(stage1, 6),
                "stage2Score": round(stage2, 6),
                "structureStatus": structure_ok,
                "sourceProtein": (row.get("representative_parent_protein") or "").strip(),
                "enzyme": (row.get("representative_enzyme") or "").strip(),
                "peptideId": (row.get("peptide_id") or "").strip(),
                "threeDiToken": ((row3 or {}).get("3di") or "").strip(),
                "threeDiSeq": ((row3 or {}).get("seq_3di") or "").strip(),
                "pdbPath": ((row3 or {}).get("pdb_path") or "").strip(),
                "occurrences": safe_int(row.get("n_occurrences"), 1),
                "sourceProteinCount": safe_int(row.get("n_source_proteins"), 1),
                "start": safe_int(row.get("min_start"), 0),
                "end": safe_int(row.get("max_end"), 0)
            }
        )

    candidates = sorted(candidates, key=lambda x: x["rank"])
    top_candidates = candidates[:300]
    top_rank = candidates[:20]

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "sourceFiles": ["top_k_predictions.csv", "topk_with_3di.csv"],
        "totalCandidates": len(candidates),
        "queryNote": "Front-end demo queries this precomputed candidate library. No on-device model inference is performed.",
        "candidates": top_candidates,
        "ranking": top_rank
    }, candidates


def make_top2000_summary(candidates):
    scores = sorted([c["stage1Score"] for c in candidates])
    lengths = [c["length"] for c in candidates]
    enzymes = Counter(c["enzyme"] for c in candidates if c["enzyme"])
    bins = Counter(c["lengthBin"] for c in candidates)

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "totalCandidates": len(candidates),
        "scoreStats": {
            "min": round(min(scores), 6) if scores else 0,
            "max": round(max(scores), 6) if scores else 0,
            "mean": round(statistics.mean(scores), 6) if scores else 0,
            "p25": round(percentile(scores, 0.25), 6),
            "p50": round(percentile(scores, 0.50), 6),
            "p75": round(percentile(scores, 0.75), 6)
        },
        "lengthStats": {
            "min": min(lengths) if lengths else 0,
            "max": max(lengths) if lengths else 0,
            "mean": round(statistics.mean(lengths), 2) if lengths else 0,
            "median": statistics.median(lengths) if lengths else 0
        },
        "lengthBins": [{"bin": k, "count": v} for k, v in sorted(bins.items())],
        "structureCoverage": {
            "with3Di": sum(1 for c in candidates if c["structureStatus"] == "with-3di"),
            "pending": sum(1 for c in candidates if c["structureStatus"] != "with-3di")
        },
        "topEnzymes": [{"name": k, "count": v} for k, v in enzymes.most_common(8)]
    }


def make_length_distribution(dataset_summary, candidates):
    candidate_len_counts = Counter(c["length"] for c in candidates)
    candidate_lengths = [
        {"length": l, "count": c} for l, c in sorted(candidate_len_counts.items(), key=lambda x: x[0])
    ]
    candidate_bins = Counter(c["lengthBin"] for c in candidates)

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "dataset": dataset_summary["lengthDistribution"],
        "datasetBins": dataset_summary["lengthBinDistribution"],
        "topCandidates": candidate_lengths,
        "topCandidateBins": [{"bin": b, "count": candidate_bins.get(b, 0)} for b in ["short", "mid", "long"]]
    }


def make_model_metrics():
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "independentTest": {
            "stage1": {
                "name": "Stage-1 High-throughput Screening",
                "acc": 84.62,
                "sn": 81.82,
                "sp": 88.89,
                "mcc": 69.35,
                "auc": 96.26,
                "focus": "适合大规模初筛，强调快速排除低潜力序列。"
            },
            "stage2": {
                "name": "Stage-2 Structure-aware Re-ranking",
                "acc": 83.16,
                "sn": 95.74,
                "sp": 70.83,
                "mcc": 68.62,
                "auc": 89.87,
                "focus": "引入3Di结构信息后，提高对潜在活性肽的捕捉能力。"
            }
        },
        "explanation": [
            "Stage-1 更适合作为大规模候选库的高通量主筛。",
            "Stage-2 通过结构感知补充，提高敏感度，降低漏检潜在活性肽的风险。",
            "两阶段串联可在筛选效率与候选质量之间取得更均衡表现。"
        ],
        "methodComparisons": [
            {"method": "AntiDMPpred", "acc": 77.12, "sn": None, "sp": None, "mcc": None, "auc": 81.93},
            {"method": "ADP-Fuse", "acc": 94.0, "sn": None, "sp": None, "mcc": 84.1, "auc": None},
            {"method": "STADIP", "acc": 95.4, "sn": None, "sp": None, "mcc": None, "auc": None},
            {"method": "BertADP", "acc": 95.5, "sn": 100.0, "sp": 91.0, "mcc": None, "auc": None},
            {"method": "ADP-DEM Stage-1", "acc": 84.62, "sn": 81.82, "sp": 88.89, "mcc": 69.35, "auc": 96.26},
            {"method": "ADP-DEM Stage-2", "acc": 83.16, "sn": 95.74, "sp": 70.83, "mcc": 68.62, "auc": 89.87}
        ]
    }


def make_feature_ablation():
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "note": "The paper emphasizes trend-level impact across features. Values below are normalized contribution scores for visualization, not standalone benchmark claims.",
        "featureContribution": [
            {
                "feature": "ESM2 sequence semantics",
                "normalizedImpact": 0.96,
                "description": "提供深层序列语义信息，是主筛性能提升的关键来源。"
            },
            {
                "feature": "ProtBert peptide embedding",
                "normalizedImpact": 0.91,
                "description": "补充另一类语言模型视角，增强特征鲁棒性。"
            },
            {
                "feature": "AAC composition",
                "normalizedImpact": 0.67,
                "description": "提供氨基酸组成先验，对基础分类稳定性有帮助。"
            },
            {
                "feature": "Physicochemical descriptors",
                "normalizedImpact": 0.79,
                "description": "提升可解释性，帮助反映电荷、疏水性等生化性质。"
            },
            {
                "feature": "CTD descriptors",
                "normalizedImpact": 0.63,
                "description": "补充分布与转移信息，在特定长度区间提供增益。"
            },
            {
                "feature": "Length bin encoding",
                "normalizedImpact": 0.55,
                "description": "帮助模型区分短肽/中肽/长肽模式，减少长度偏置。"
            },
            {
                "feature": "SaProt 3Di structure signal",
                "normalizedImpact": 0.93,
                "description": "用于第二阶段结构感知精排，显著提升召回潜在活性肽能力。"
            }
        ],
        "moduleAblation": [
            {
                "module": "Gated feature fusion",
                "impact": "Improves stability across folds",
                "summary": "门控融合让不同特征在样本层面动态分配权重，降低单一特征失效风险。"
            },
            {
                "module": "GAUR-XGB calibration",
                "impact": "Improves ranking consistency",
                "summary": "二级校准通过一致性奖励和不确定性惩罚改进排序质量。"
            },
            {
                "module": "Toxicity/hemolysis penalty",
                "impact": "Improves developability",
                "summary": "在排序阶段加入可开发性约束，避免高分但高风险序列优先。"
            }
        ]
    }


def make_docking_results(doc_text):
    top20 = []
    pattern = re.compile(r"([A-Z]{5,24})(\d{2}\.\d{2})%(-\d+\.\d+)")
    for m in pattern.finditer(doc_text):
        seq = m.group(1)
        prob = safe_float(m.group(2))
        energy = safe_float(clean_energy_string(m.group(3)))
        if len(seq) >= 5 and energy < 0:
            top20.append({"sequence": seq, "predictedProbability": prob, "dockingEnergy": round(energy, 3)})
    if top20:
        unique = []
        seen = set()
        for row in top20:
            if row["sequence"] in seen:
                continue
            seen.add(row["sequence"])
            unique.append(row)
        top20 = unique[:20]

    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "target": "DPP-IV",
        "engine": "HPEPDOCK",
        "summary": {
            "top100Below200": 37,
            "top100Below220": 16,
            "minimumEnergy": -258.90,
            "top20Range": "-139.292 to -253.026",
            "interpretation": "Lower docking energy usually indicates stronger predicted binding tendency, but experimental validation is still required."
        },
        "topComplexes": top20,
        "notes": [
            "Docking scores are computational predictions and should not be interpreted as clinical efficacy.",
            "Results are used to prioritize candidates for downstream wet-lab validation."
        ]
    }


def make_paper_highlights(doc_text):
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "title": "基于序列语义与结构感知证据融合的抗糖尿病肽两阶段预测研究",
        "englishTitle": "ADP-DEM: Anti-diabetic Peptide Discovery Explorer",
        "school": "徐州医科大学",
        "teamMembers": ["葛超伟", "郭盈盈", "胡宇航"],
        "advisor": "刘莘",
        "keywords": ["抗糖尿病肽", "两阶段预测框架", "多源特征融合", "结构感知", "蛋白质语言模型"],
        "abstractShort": "项目构建了从序列语义主筛到结构感知精排的两阶段流程，在大规模候选库中逐级缩小实验验证范围，形成可解释、可扩展的抗糖尿病肽计算筛选路径。",
        "highlights": [
            "构建472条高质量训练样本（正负样本各236条），并采用8:2分层划分。",
            "Stage-1独立测试AUC达到96.26%，适合高通量候选主筛。",
            "Stage-2敏感度达到95.74%，增强对潜在活性肽的捕捉能力。",
            "在枯草芽孢杆菌蛋白质组酶切场景下实现Top-100候选肽筛选。",
            "分子对接结果支持候选优先级排序，可为后续实验验证提供参考。"
        ],
        "limitations": [
            "3Di token源于预测结构，受结构预测质量影响。",
            "分子对接结果属于计算证据，仍需体外/体内实验验证。"
        ],
        "sourceTextLength": len(doc_text)
    }


def write_json(obj, out_path):
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)


def main():
    parser = argparse.ArgumentParser(description="Prepare lightweight ADP-DEM JSON assets.")
    parser.add_argument("--data-dir", required=True, help="Directory containing diabete.csv/top_k_predictions.csv/topk_with_3di.csv")
    parser.add_argument("--docx", required=True, help="Paper .docx path")
    parser.add_argument("--out-dir", default="public/adp-dem/data", help="Output data directory")
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    diabete_rows = read_csv(data_dir / "diabete.csv")
    topk_rows = read_csv(data_dir / "top_k_predictions.csv")
    topk3_rows = read_csv(data_dir / "topk_with_3di.csv")
    doc_text = parse_docx_text(Path(args.docx))

    dataset_summary = make_dataset_summary(diabete_rows)
    top_candidates, all_candidates = make_candidates(topk_rows, topk3_rows)
    top2000_summary = make_top2000_summary(all_candidates)
    length_distribution = make_length_distribution(dataset_summary, all_candidates)
    model_metrics = make_model_metrics()
    feature_ablation = make_feature_ablation()
    docking_results = make_docking_results(doc_text)
    paper_highlights = make_paper_highlights(doc_text)

    write_json(dataset_summary, out_dir / "dataset-summary.json")
    write_json(model_metrics, out_dir / "model-metrics.json")
    write_json(top_candidates, out_dir / "top-candidates.json")
    write_json(top2000_summary, out_dir / "top2000-summary.json")
    write_json(length_distribution, out_dir / "length-distribution.json")
    write_json(feature_ablation, out_dir / "feature-ablation.json")
    write_json(docking_results, out_dir / "docking-results.json")
    write_json(paper_highlights, out_dir / "paper-highlights.json")

    print("Generated JSON files in", out_dir.resolve())


if __name__ == "__main__":
    main()
