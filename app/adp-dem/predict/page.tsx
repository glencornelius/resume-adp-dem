import { AppShell } from "@/components/adp-dem/AppShell";
import { PredictionWorkbench } from "@/components/adp-dem/PredictionWorkbench";
import { getBackendApiBase, isBackendApiConfigured } from "@/lib/adp-dem/api";
import { loadAdpDemData } from "@/lib/adp-dem/data";

export default async function AdpPredictPage({
  searchParams
}: {
  searchParams?: Promise<{ sequence?: string; tab?: string }>;
}) {
  const data = await loadAdpDemData();
  const params = await searchParams;
  const initialSequence = params?.sequence ?? "";
  const initialTab = params?.tab ?? "single";

  return (
    <AppShell
      title="Prediction Workbench"
      subtitle={`核心预测工作台：输入序列、预测分析、可视化解释、候选推荐与结果导出（API: ${isBackendApiConfigured() ? getBackendApiBase() : "未配置"}）`}
    >
      <PredictionWorkbench
        candidates={data.topCandidates.candidates}
        initialSequence={initialSequence}
        initialTab={initialTab}
        backendConfigured={isBackendApiConfigured()}
      />
    </AppShell>
  );
}
