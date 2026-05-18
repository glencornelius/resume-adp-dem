import { AppShell } from "@/components/adp-dem/AppShell";
import { ReportsHub } from "@/components/adp-dem/ReportsHub";

export default function AdpReportsPage() {
  return (
    <AppShell title="Reports" subtitle="历史预测、批量任务、报告生成与本地数据管理">
      <ReportsHub />
    </AppShell>
  );
}
