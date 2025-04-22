'use client'
import { ImageProvider } from "@/providers/image-provider"
import ProductPageModifyPre from "./ProductPageModifyPre"
import { useParams } from "next/navigation";

export default function ProductPageModify( ) {
  const params = useParams<{ id: string }>(); 
  
  
  return (
      <ImageProvider>
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <ProductPageModifyPre id={params.id} />
        </div>
      </ImageProvider>
    )
}