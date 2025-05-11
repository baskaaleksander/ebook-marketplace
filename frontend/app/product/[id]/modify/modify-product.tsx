'use client';

import FileUploader from "@/components/file-uploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@/lib/definitions";
import { ImageProvider } from "@/providers/image-provider";
import api from "@/utils/axios";
import { FileIcon, Loader2, X } from "lucide-react";
import { use, useEffect, useState } from "react";
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import ModifyProductSkeleton from "@/components/modify-product-skeleton";

// Zod schema for form validation
const createProductSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters" }),
    description: z.string().min(2, { message: "Description must be at least 2 characters" }),
    price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
    category: z.string().min(1, { message: "Please select a category" }),
});

// Type inference from Zod schema for form values
type CreateProductFormValues = z.infer<typeof createProductSchema>;

// Available product categories
const categories = [
  { id: "Fiction", name: "Fiction" },
  { id: "nonfiction", name: "Non-Fiction" },
  { id: "educationandprofessional", name: "Education & Professional" },
  { id: "creativeandlifestyle", name: "Creative & Lifestyle" },
  { id: "graphics", name: "Graphics & Design" },
];

/**
 * Main component for modifying an existing product
 * Handles form state, file uploads, and API interactions
 */
function ModifyProductChildren({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // const { image, setImage } = useImage(); // Context for image handling
    const [error, setError] = useState<string | null>(null) // General error state
    const [success, setSuccess] = useState(false); // Success status for form submission
    const [isLoading, setIsLoading] = useState(false); // Loading state for form submission
    const [product, setProduct] = useState<Product | null>(null); // Product data
    const [pdfFile, setPdfFile] = useState<File | null>(null); // PDF file to upload
    // const [oldImageUrl, setOldImageUrl] = useState<string | null>(null); // Image URL for the product
    // const [imgChanged, setImgChanged] = useState(false); // Track if image was changed by user
    const [pdfLoading, setPdfLoading] = useState(true); // Loading state for PDF
    const [pdfError, setPdfError] = useState(false); // Error state for PDF
    const [pdfChanged, setPdfChanged] = useState(false); // Track if PDF was changed by user
    const [pageLoading, setPageLoading] = useState(true); // Loading state for the entire page
    const resolvedParams = use(params); // Resolve the Promise to get the product ID
    const id = resolvedParams.id;
    
    // Initialize form with Zod schema
    const form = useForm<CreateProductFormValues>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            category: "",
        },
    });
    
    // Fetch product data when component mounts
    useEffect(() => {
      const fetchData = async () => {
        try {
          setPageLoading(true);
          setPdfLoading(true);
          
          // Get product data from API
          const response = await api.get(`/listing/${id}`);
          const productData = response.data.data;
          
          setProduct(productData);
          
          // // Fetch and convert the remote image to a data URL
          // if (productData.imageUrl) {
          //   try {
          //     setOldImageUrl(productData.imageUrl);
              
          //   } catch (imageError) {
          //     console.error("Error loading image:", imageError);
          //     setOldImageUrl(null);
          //   }
          // }
          
          // Populate form with existing product data
          form.reset({
            title: productData.title || "",
            description: productData.description || "",
            price: productData.price || 0,
            category: productData.category || productData.categories?.[0]?.name || "",
          });

          // Handle PDF file if exists
          if (productData.fileUrl) {
            try {
              // Create a placeholder file object for UI
              // We don't actually download the PDF, just create a reference to it
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
          setPageLoading(false);
        }
      };
      
      fetchData();
    }, [id, form]);

    // useEffect(() => {
    //   // If image context has a value and it's different from oldImageUrl
    //   if (image && image !== oldImageUrl) {
    //     setImgChanged(true);
    //   }
    // }, [image, oldImageUrl]);

    /**
     * Handle image deletion
     */
    // const handleImageDelete = () => {
    //   setImage(null); // Clear the image state
    //   setImgChanged(true); // Mark that image needs to be uploaded
    // };
    /**
     * Handle PDF file selection
     * @param file - The selected PDF file
     */
    const handlePdfSelect = (file: File) => {
      setPdfFile(file);
      setPdfChanged(true); // Mark that PDF needs to be uploaded
      setPdfError(false);
    };

    /**
     * Remove the selected PDF file
     */
    const clearPdfFile = () => {
      setPdfFile(null);
      setPdfChanged(true); // Mark that PDF was changed (removed)
    };

    /**
     * Handle form submission to update the product
     * @param data - Validated form data
     */
    const onSubmit = async (data: CreateProductFormValues) => {
      try {
        setError(null);
        setIsLoading(true);
        
        // to fix
        // // Handle image upload if image was changed
        // let imageUrl = product?.imageUrl || ""; // Start with existing URL
        
        // // Debug current state
        // console.log("Current state:", { 
        //   imgChanged, 
        //   image: image?.substring(0, 50), // Just log the start of the image string
        //   oldImageUrl: oldImageUrl?.substring(0, 50) 
        // });

        // // Image handling logic
        // if (imgChanged || !oldImageUrl) {
        //   if (image) {
        //     // Always try to upload the image if it's changed and exists
        //     console.log('Uploading new image:', image);
        //     try {
        //       // Convert data URL or blob URL to file and upload
        //       const response = await fetch(image);
        //       const blob = await response.blob();
        //       const imageFile = new File([blob], "product-image.jpg", { type: "image/jpeg" });
              
        //       const imageFormData = new FormData();
        //       imageFormData.append('file', imageFile);
              
        //       const imageUploadResponse = await api.post('/upload', imageFormData, {
        //         headers: {
        //           'Content-Type': 'multipart/form-data',
        //         }
        //       });
              
        //       // Update imageUrl with the one from the server
        //       imageUrl = imageUploadResponse.data.imageUrl || 
        //                 imageUploadResponse.data.url || // Try alternate property
        //                 `http://localhost:3000/uploads/${imageUploadResponse.data.filename}`;
              
        //       console.log("Image uploaded successfully:", imageUrl);
        //     } catch (uploadError) {
        //       console.error("Error uploading image:", uploadError);
        //       // If upload fails, keep the old URL
        //       if (oldImageUrl) {
        //         imageUrl = oldImageUrl;
        //         console.log("Keeping old image URL:", imageUrl);
        //       }
        //     }
        //   } else {
        //     // Image was deliberately deleted
        //     imageUrl = "";
        //     console.log("Image was deleted");
        //   }
        // } else {
        //   // Image wasn't changed, keep the old URL
        //   console.log("Image wasn't changed, keeping old URL:", imageUrl);
        // }

        // Handle PDF file upload if changed
        let fileUrl = product?.fileUrl || "";
        
        if (pdfChanged) {
          if (pdfFile) {
            // Upload new PDF file
            const pdfFormData = new FormData();
            pdfFormData.append('file', pdfFile);
            
            const pdfUploadResponse = await api.post('/upload', pdfFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              }
            });
            
            fileUrl = pdfUploadResponse.data.url || 
                    `http://localhost:3000/uploads/${pdfUploadResponse.data.filename}`;
          } else {
            // PDF was removed
            fileUrl = "";
          }
        }


        // Update product in database
        await api.patch(`/listing/${id}`, {
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          fileUrl,
        });
     
        setSuccess(true);
        
        // Redirect to product page after update
        setTimeout(() => {
          router.push(`/product/${id}`);
        }, 2000);
        
      } catch (err) {
        console.error("Error updating product:", err);
        setError("Failed to update product");
      } finally {
        setIsLoading(false);
      }
    };

    // Show skeleton loader while data is being fetched
    if (pageLoading) {
      return <ModifyProductSkeleton />;
    }

    // Extract filename from URL for display purposes
    const fileName = product?.fileUrl ? product.fileUrl.split('/').pop() : "No file selected";
    
    return (
      <ImageProvider>

      <div className="flex flex-col gap-8">
        <h1 className="text-3xl font-bold">Edit Product</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column: Image and PDF uploads */}
          <div className="space-y-6">
            {/* Image upload section */}
            {product?.imageUrl && <div>
              <h2 className="text-lg font-semibold mb-4">Product Image</h2>
              <img src={product?.imageUrl} alt="Product" className="hidden" />
              {/* {oldImageUrl ? <ImagePreview handleImageDelete={handleImageDelete} imageUrl={oldImageUrl} /> : <ImageResizer /> } */}
            </div>
            }
            
            {/* PDF upload section with different states */}
            <div>
              <h2 className="text-lg font-semibold mb-4">PDF File</h2>
              {pdfLoading ? (
                // PDF loading state
                <Card className="p-6 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                  <p>Loading PDF file...</p>
                </Card>
              ) : pdfError ? (
                // PDF error state
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
                // No PDF selected state
                <FileUploader
                  onFileSelect={handlePdfSelect}
                  accept="application/pdf"
                  maxSize={20}
                  label="Drag & drop your PDF file here"
                />
              ) : (
                // PDF selected state - shows file info
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
                    {/* Show badge indicating if file is current or new */}
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
          
          {/* Right column: Product details form */}
          <div>
            <Card>
              <CardContent className="pt-6">
                {/* Error message display */}
                {error && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Success message display */}
                {success && (
                  <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                    <AlertDescription>Product updated successfully! Redirecting...</AlertDescription>
                  </Alert>
                )}
                
                {/* Product edit form */}
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Title field */}
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
                    
                    {/* Description field */}
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
                      {/* Price field */}
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">PLN</span>
                                <Input 
                                  type="number" 
                                  min="0" 
                                  step="0.01"
                                  placeholder="0.00" 
                                  className="pl-12" 
                                  {...field} 
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Category selection field */}
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
                    
                    {/* Submit button with loading state */}
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
      </ImageProvider>
    );
}
  
/**
 * Wrapper component that provides the ImageProvider context
 * This ensures the image state is available throughout the component tree
 */
export default function ModifyProduct({ params }: { params: Promise<{ id: string }> }) {
    return (
      <ImageProvider>
        <ModifyProductChildren params={params} />
      </ImageProvider>
    );
}

// function ImagePreview( { imageUrl, handleImageDelete }: { imageUrl: string, handleImageDelete: () => void }) {
//   return (
//             <Card className="w-full max-w-md p-4">
//               <CardContent className="flex flex-col items-center">
//                 <div className="mt-4 relative">
//                   <img
//                     src={imageUrl}
//                     alt="Product image"
//                     className="w-64 h-64 object-cover rounded-xl shadow"
//                   />
//                   {/* Remove button positioned at top-right of image */}
//                   <div className="absolute -top-3 -right-3 flex gap-2">
//                     <Button
//                       variant="secondary"
//                       onClick={() => handleImageDelete()}
//                       className="h-8 w-8 rounded-full p-0"
//                       aria-label="Clear image"
//                     >
//                       <LiaTimesSolid />
//                     </Button>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>
//   )
// }