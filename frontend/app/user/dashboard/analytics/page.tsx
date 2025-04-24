import { Metadata } from "next";
import Analytics from "./analytics";

export const metadata : Metadata = {
  title: "Analytics | bookify",
  description: "Analytics page",
  openGraph: {
    title: "Analytics | bookify",
    description: "Analytics page",
  },
}
export default function AnalyticsPage() {
  return <Analytics />
}