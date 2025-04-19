'use client';

import FileUploader from "@/components/file-uploader";
import ImageResizer from "@/components/image-resizer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/definitions";
import { ImageProvider, useImage } from "@/providers/image-provider";
import api from "@/utils/axios";
import { FileIcon, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { title } from "process";

const createProductSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters" }),
    description: z.string().min(2, { message: "Description must be at least 2 characters" }),
    price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
    category: z.string().min(1, { message: "Please select a category" }),
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

const categories = [
  { id: "Fiction", name: "Fiction" },
  { id: "nonfiction", name: "Non-Fiction" },
  { id: "educationandprofessional", name: "Education & Professional" },
  { id: "creativeandlifestyle", name: "Creative & Lifestyle" },
  { id: "graphics", name: "Graphics & Design" },
];

function ProductPageModifyPre({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { image, setImage } = useImage();
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfLoading, setPdfLoading] = useState(true);
    const [pdfError, setPdfError] = useState(false);
    const [pdfChanged, setPdfChanged] = useState(false);
    const { id } = params;
    
    const form = useForm<CreateProductFormValues>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            category: "",
        },
    });
    
    useEffect(() => {
      const fetchData = async () => {
        try {
          setPdfLoading(true);
          
          const response = await api.get(`/listing/${id}`);
          const productData = response.data;
          
          setProduct(productData);
          setImage(productData.imageUrl);
          
          form.reset({
            title: productData.title || "",
            description: productData.description || "",
            price: productData.price || 0,
            category: productData.category || productData.categories?.[0]?.name || "",
          });

          if (productData.fileUrl) {
            try {

              const emptyBlob = new Blob([], { type: 'application/pdf' });
              const fileName = productData.fileName || productData.fileUrl.split('/').pop() || 'file.pdf';
              
              const file = new File([emptyBlob], fileName, { type: 'application/pdf' });
              
              setPdfFile(file);
              setPdfError(false);
            } catch (pdfError) {
              console.error("Error loading PDF file:", pdfError);
              setPdfError(true);
            }
          }
          
        } catch (error) {
          console.error("Error fetching product:", error);
          setError("Failed to load product data");
        } finally {
          setPdfLoading(false);
        }
      };
      
      fetchData();
    }, [id, setImage, form]);

    const handlePdfSelect = (file: File) => {
      setPdfFile(file);
      setPdfChanged(true);
      setPdfError(false);
    };

    const clearPdfFile = () => {
      setPdfFile(null);
      setPdfChanged(true);
    };

    const onSubmit = async (data: CreateProductFormValues) => {
      try {
        setError(null);
        setIsLoading(true);
        
        let imageUrl = "";
        if (image) {
          if (image.startsWith('data:') || image.startsWith('blob:')) {
            const response = await fetch(image);
            const blob = await response.blob();
            const imageFile = new File([blob], "product-image.jpg", { type: "image/jpeg" });
            
            const imageFormData = new FormData();
            imageFormData.append('file', imageFile);
            
            const imageUploadResponse = await api.post('/upload', imageFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            });
            
            imageUrl = imageUploadResponse.data.imageUrl || 
                      `http://localhost:3000/uploads/${imageUploadResponse.data.filename}`;
          } else {
            imageUrl = image;
          }
        }

        let fileUrl = product?.fileUrl || "";
        
        if (pdfChanged) {
          if (pdfFile) {

            const pdfFormData = new FormData();
            pdfFormData.append('file', pdfFile);
            
            const pdfUploadResponse = await api.post('/upload', pdfFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            });
            
            fileUrl = pdfUploadResponse.data.fileUrl || 
                    `http://localhost:3000/uploads/${pdfUploadResponse.data.filename}`;
          } else {
            fileUrl = "";
          }
        }

        await api.put(`/listing/${id}`, {
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          imageUrl,
          fileUrl,
          fileName
        });
     
        setSuccess(true);
        
        setTimeout(() => {
          router.push(`/product/${id}`);
        }, 2000);
        
      } catch (err: any) {
        console.error("Error updating product:", err);
        setError(err.response?.data?.message || "Failed to update product");
      } finally {
        setIsLoading(false);
      }
    };

    const fileName = product?.fileUrl ? product.fileUrl.split('/').pop() : "No file selected";
    
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Product Image</h2>
              <ImageResizer />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">PDF File</h2>
              {pdfLoading ? (
                <Card className="p-6 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <p>Loading PDF file...</p>
                </Card>
              ) : pdfError ? (
                <div className="space-y-4">
                  <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4">
                    <p>There was an error loading the PDF file. Please upload it again.</p>
                  </div>
                  <FileUploader
                    onFileSelect={handlePdfSelect}
                    accept="application/pdf"
                    maxSize={20}
                    label="Drag & drop your PDF file here"
                  />
                </div>
              ) : !pdfFile ? (
                <FileUploader
                  onFileSelect={handlePdfSelect}
                  accept="application/pdf"
                  maxSize={20}
                  label="Drag & drop your PDF file here"
                />
              ) : (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-6 w-6 text-red-500" />
                        <div>
                          <p className="font-medium truncate max-w-[200px]">{pdfFile.name}</p>
                          {pdfFile.size > 0 && (
                            <p className="text-xs text-gray-500">
                              {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={clearPdfFile}
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {product && fileName === pdfFile.name && !pdfChanged ? (
                      <Badge variant="outline" className="mt-2 bg-blue-50 text-blue-700 border-blue-200">
                        Current PDF File
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                        PDF Ready to Upload
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          
          <div>
            <Card>
              <CardContent className="pt-6">
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {success && (
                  <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>Product updated successfully! Redirecting...</AlertDescription>
                  </Alert>
                )}
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Product title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your product in detail" 
                              className="min-h-32" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01"
                                  placeholder="0.00" 
                                  className="pl-7" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem 
                                    key={category.id} 
                                    value={category.name}
                                  >
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : "Update Product"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
}
  
export default function ProductPageModify({ params }: { params: { id: string } }) {
    return (
      <ImageProvider>
        <div className="container mx-auto px-4 py-8 min-h-screen">
          <ProductPageModifyPre params={params} />
        </div>
      </ImageProvider>
    )
}