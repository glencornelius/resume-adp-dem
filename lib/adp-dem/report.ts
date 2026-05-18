import { PredictionResult, ReportDraftItem } from "@/lib/adp-dem/types";
import { predictionLevelText } from "@/lib/adp-dem/predict";

export const SCIENTIFIC_DISCLAIMER =
  "本报告仅用于科研展示和计算辅助筛选，不构成医学诊断、用药建议或临床结论。所有候选序列均需经过独立实验验证。";

export type ReportTemplateKind = "research" | "portfolio" | "batch";

export function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function modelModeText(mode?: PredictionResult["modelMode"]) {
  return mode === "online" ? "真实模型推理" : "离线演示分析";
}

export function shortModeText(mode?: PredictionResult["modelMode"]) {
  return mode === "online" ? "真实模型" : "离线演示";
}

export function openPrintReport(html: string) {
  const report = window.open("", "_blank", "width=1080,height=820");
  if (!report) return;
  report.document.write(html);
  report.document.close();
  report.focus();
  report.print();
}

function reportShell(title: string, body: string, modeLabel: string) {
  const safeTitle = escapeHtml(title);
  const safeMode = escapeHtml(modeLabel);

  return `<!doctype html>
  <html lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <title>${safeTitle}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif; padding: 30px; line-height: 1.65; color: #111827; }
        h1 { margin: 0 0 8px; font-size: 26px; }
        h2 { margin: 24px 0 8px; font-size: 17px; }
        .meta { color: #4b5563; font-size: 13px; }
        .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; margin: 12px 0; }
        .seq { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; word-break: break-all; }
        .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .muted { color: #6b7280; }
        .disclaimer { margin-top: 24px; border-color: #f59e0b; background: #fffbeb; }
        @media print { body { padding: 18px; } }
      </style>
    </head>
    <body>
      <h1>${safeTitle}</h1>
      <p class="meta">生成时间：${escapeHtml(new Date().toLocaleString())} · 当前模式：${safeMode}</p>
      ${body}
      <section class="card disclaimer"><strong>科研免责声明</strong><br />${escapeHtml(SCIENTIFIC_DISCLAIMER)}</section>
    </body>
  </html>`;
}

export function buildSinglePredictionReport(result: PredictionResult) {
  const modelLine =
    result.modelMode === "online"
      ? `<p><strong>模型预测概率：</strong>${escapeHtml(`${((result.modelProbability ?? 0) * 100).toFixed(2)}%`)}</p>`
      : `<p><strong>启发式评分：</strong>${escapeHtml(typeof result.heuristicScore === "number" ? `${result.heuristicScore.toFixed(1)} / 100` : "--")}</p>`;

  const candidateLine =
    result.modelMode === "online" && typeof result.candidateRank === "number"
      ? `<p><strong>候选排名：</strong>#${escapeHtml(result.candidateRank)}</p>`
      : `<p><strong>候选库命中：</strong>${escapeHtml(result.candidateHit ? "命中" : "未命中")}</p>`;

  const body = `
    <section class="card">
      <h2>输入序列</h2>
      <p class="seq">${escapeHtml(result.sequence)}</p>
    </section>
    <section class="card grid">
      <div><strong>结果来源：</strong>${escapeHtml(result.source)}</div>
      <div><strong>可信等级：</strong>${escapeHtml(result.confidenceLabel)}</div>
      <div><strong>长度：</strong>${escapeHtml(result.properties.length)} aa</div>
      <div><strong>疏水性：</strong>${escapeHtml(`${(result.properties.hydrophobicRatio * 100).toFixed(1)}%`)}</div>
      <div><strong>净电荷：</strong>${escapeHtml(result.properties.netCharge)}</div>
      <div><strong>相似候选：</strong>${escapeHtml(result.similarCandidates.length)} 条</div>
    </section>
    <section class="card">
      <h2>分析结果</h2>
      <p><strong>等级：</strong>${escapeHtml(predictionLevelText(result.level))}</p>
      ${modelLine}
      ${candidateLine}
      <p>${escapeHtml(result.explanation)}</p>
    </section>
    <section class="card">
      <h2>可视化摘要</h2>
      <p class="muted">氨基酸组成、性质雷达图与候选相似性已在平台结果页展示，导出报告保留关键统计摘要。</p>
    </section>`;

  return reportShell("ADP-DEM 单条预测报告", body, modelModeText(result.modelMode));
}

export function buildBatchPredictionReport(results: PredictionResult[], invalidCount: number, total: number) {
  const onlineCount = results.filter((item) => item.modelMode === "online").length;
  const modeLabel = onlineCount > 0 ? "混合：真实模型 / 离线演示" : "离线演示分析";
  const highCount = results.filter((item) => item.level === "high").length;
  const rows = results
    .slice(0, 30)
    .map(
      (item) => `<tr>
        <td class="seq">${escapeHtml(item.sequence)}</td>
        <td>${escapeHtml(modelModeText(item.modelMode))}</td>
        <td>${escapeHtml(predictionLevelText(item.level))}</td>
        <td>${escapeHtml(item.candidateHit ? "是" : "否")}</td>
      </tr>`
    )
    .join("");

  const body = `
    <section class="card grid">
      <div><strong>总输入：</strong>${escapeHtml(total)}</div>
      <div><strong>有效序列：</strong>${escapeHtml(results.length)}</div>
      <div><strong>无效序列：</strong>${escapeHtml(invalidCount)}</div>
      <div><strong>高潜力：</strong>${escapeHtml(highCount)}</div>
    </section>
    <section class="card">
      <h2>分析结果</h2>
      <table width="100%" cellspacing="0" cellpadding="6">
        <thead><tr><th align="left">输入序列</th><th align="left">当前模式</th><th align="left">结果</th><th align="left">候选命中</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="muted">仅显示前 30 条，完整结果请使用 CSV 导出。</p>
    </section>
    <section class="card">
      <h2>可视化摘要</h2>
      <p class="muted">批量筛选建议结合候选库命中、启发式性质与真实模型结果分层查看。</p>
    </section>`;

  return reportShell("ADP-DEM 批量筛选报告", body, modeLabel);
}

function templateTitle(kind: ReportTemplateKind) {
  if (kind === "research") return "ADP-DEM 科研报告版";
  if (kind === "portfolio") return "ADP-DEM 简历展示版";
  return "ADP-DEM 批量筛选版";
}

export function buildDraftReport(items: ReportDraftItem[], kind: ReportTemplateKind) {
  const modeSet = new Set(items.map((item) => item.modelMode).filter(Boolean));
  const modeLabel = modeSet.has("online") ? "真实模型 / 离线演示" : "离线演示分析";
  const sections = items
    .map(
      (item) => `<section class="card">
        <h2>${escapeHtml(item.title)}</h2>
        <p class="meta">${escapeHtml(item.source)} · ${escapeHtml(new Date(item.createdAt).toLocaleString())}${item.modelMode ? ` · ${escapeHtml(modelModeText(item.modelMode))}` : ""}</p>
        ${item.sequence ? `<p><strong>输入序列：</strong><span class="seq">${escapeHtml(item.sequence)}</span></p>` : ""}
        <p style="white-space:pre-line">${escapeHtml(item.content)}</p>
      </section>`
    )
    .join("");

  const body = `
    <section class="card">
      <h2>报告模板</h2>
      <p>${escapeHtml(templateTitle(kind))}</p>
    </section>
    ${sections || '<section class="card"><p class="muted">暂无报告草稿内容。</p></section>'}
    <section class="card">
      <h2>可视化摘要</h2>
      <p class="muted">平台内的性质雷达图、候选表格与历史记录共同构成报告依据。</p>
    </section>`;

  return reportShell(templateTitle(kind), body, modeLabel);
}
