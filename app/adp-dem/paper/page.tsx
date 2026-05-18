import { redirect } from "next/navigation";

export default function LegacyPaperRoute() {
  redirect("/adp-dem/research?tab=paper");
}
