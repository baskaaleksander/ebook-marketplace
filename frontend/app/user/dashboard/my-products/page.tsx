import { Metadata } from "next";
import MyProducts from "./my-products";

export const metadata : Metadata = {
  title: "My Products | bookify",
  description: "My Products page",
  openGraph: {
    title: "My Products | bookify",
    description: "My Products page",
  },
}
export default function MyProductsPage() {

  return <MyProducts />
}