import { AppShell } from "@/components/adp-dem/AppShell";
import { LibraryHub } from "@/components/adp-dem/LibraryHub";
import { loadResultsData } from "@/lib/adp-dem/data";

export default async function AdpLibraryPage() {
  const { topCandidates, dockingResults } = await loadResultsData();

  return (
    <AppShell title="Library" subtitle="候选库、Top 排名、分子对接和收藏候选统一管理">
      <LibraryHub
        candidates={topCandidates.candidates}
        ranking={topCandidates.ranking}
        dockingResults={dockingResults}
        totalCandidates={topCandidates.totalCandidates}
      />
    </AppShell>
  );
}
