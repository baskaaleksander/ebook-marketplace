import { Metadata } from "next";
import ProductPage from "./product-page";
import api from "@/utils/axios";
import { Props } from "@/lib/definitions"



export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await api.get(`/listing/${params.id}`);
    const product = response.data.data;
    
    return {
      title: `${product.title} | bookify`,
      description: product.description?.slice(0, 160) || "Product description",
      openGraph: {
        title: product.title,
        description: product.description?.slice(0, 160) || "Product description",
        images: product.coverImageUrl ? [product.coverImageUrl] : [],
      },
    };
  } catch (error) {

    console.error("Error fetching product metadata:", error);
    return {
      title: "Product | bookify",
      description: "Product details page",
    };
  }
}

export default function ProductPageWithMetadata({ params }: { params: Promise<{ id: string }> }) {
  return <ProductPage params={params} />;
}