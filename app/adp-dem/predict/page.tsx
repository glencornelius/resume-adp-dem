import { AppShell } from "@/components/adp-dem/AppShell";
import { PredictionWorkbench } from "@/components/adp-dem/PredictionWorkbench";
import { getBackendApiBase, isBackendApiConfigured } from "@/lib/adp-dem/api";
import { loadAdpDemData } from "@/lib/adp-dem/data";

export default async function AdpPredictPage() {
  const data = await loadAdpDemData();

  return (
    <AppShell
      title="Prediction Workbench"
      subtitle={`核心预测工作台：输入序列、预测分析、可视化解释、候选推荐与结果导出（API: ${isBackendApiConfigured() ? getBackendApiBase() : "未配置"}）`}
    >
      <PredictionWorkbench
        candidates={data.topCandidates.candidates}
        backendConfigured={isBackendApiConfigured()}
      />
    </AppShell>
  );
}
