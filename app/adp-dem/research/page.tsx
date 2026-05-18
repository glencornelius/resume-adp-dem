import { AppShell } from "@/components/adp-dem/AppShell";
import { ResearchHub } from "@/components/adp-dem/ResearchHub";
import { loadAdpDemData } from "@/lib/adp-dem/data";

export default async function AdpResearchPage() {
  const data = await loadAdpDemData();

  return (
    <AppShell title="Research" subtitle="模型流程、数据集、性能、消融和论文资料">
      <ResearchHub
        datasetSummary={data.datasetSummary}
        modelMetrics={data.modelMetrics}
        featureAblation={data.featureAblation}
        paperHighlights={data.paperHighlights}
      />
    </AppShell>
  );
}
