'use client';

import ImageResizer from "@/components/image-resizer";
import { Product } from "@/lib/definitions";
import { ImageProvider, useImage } from "@/providers/image-provider";
import api from "@/utils/axios";
import { useEffect, useState } from "react";

function ProductPageModifyPre({ params }: { params: { id: string } }) {
    const { image, setImage } = useImage();
    const [ product, setProduct ] = useState<Product | null>(null);
    const { id } = params;
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          const response = await api.get(`/listing/${id}`);
          const productData = response.data;
          
          setProduct({
            ...productData,
          });
          
          setImage(productData.imageUrl);
          
          console.log("Setting image URL");
        } catch (error) {
          console.error("Error fetching product:", error);
        }
      };
      
      fetchData();
    }, [id, setImage]);
    
    return (
      <div>
        <ImageResizer />
      </div>
    );
}
  
export default function ProductPageModify({ params }: { params: { id: string } }) {
    return (
      <ImageProvider>
        <ProductPageModifyPre params={params} />
      </ImageProvider>
    )
}