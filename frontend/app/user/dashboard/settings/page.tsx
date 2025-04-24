import { Metadata } from "next";
import Settings from "./settings";

export const metadata : Metadata = {
  title: "Settings | bookify",
  description: "Settings page",
  openGraph: {
    title: "Settings | bookify",
    description: "Settings page",
  },
}

export default function SettingsPage() {
  return <Settings />
}