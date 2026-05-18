import { redirect } from "next/navigation";

export default function LegacyBatchRoute() {
  redirect("/adp-dem/predict?tab=batch");
}
