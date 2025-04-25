import { Metadata } from "next"
import RecentlyViewed from "./recently-viewed"

export const metadata : Metadata = {
  title: "Recently Viewed | bookify",
  description: "Recently Viewed page",
  openGraph: {
    title: "Recently Viewed | bookify",
    description: "Recently Viewed page",
  },
}

export default function RecentlyViewedPage() {
  return <RecentlyViewed />
}