import { Metadata } from "next";
import Favourites from "./favourites";

export const metadata : Metadata = {
  title: "Favourites | bookify",
  description: "Favourites page",
  openGraph: {
    title: "Favourites | bookify",
    description: "Favourites page",
  },
}

export default function FavouritesPage() {
  return <Favourites />
}