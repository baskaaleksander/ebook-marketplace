import { Props } from "@/lib/definitions";
import ModifyProduct from "./modify-product"
import { Metadata } from "next";
import api from "@/utils/axios";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const response = await api.get(`/listing/${params.id}`);
    const product = response.data.data;
    
    return {
      title: `${product.title} - modify | bookify`,
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


export default function ModifyProductPage({ params }: { params: Promise<{ id: string }> }) {
  
  return (
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <ModifyProduct params={params} />
        </div>
    )
}