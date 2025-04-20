'use client'
import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useImage } from "@/providers/image-provider"
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form"
import { Card, CardContent } from "./ui/card"
import api from "@/utils/axios"
import { Loader2, FileIcon, X } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import ImageResizer from "./image-resizer"
import FileUploader from "./file-uploader"
import { Badge } from "./ui/badge"

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
];

function CreateProductForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const { image } = useImage()

    useEffect(() => {
        if (!authLoading && !user) { 
            router.push('/login');
        }
    }, [user, authLoading, router])

    /*
    @todo:
    - Check if user has a verified stripe account before allowing them to create a product
    - If not, redirect them to the wallet page
    */
    useEffect(() => {
        if (authLoading) return;
        
        const userData = api.get(`/user/id/${user?.id}`);

        if(userData.stripeStatus !== 'verified') {
            router.push('/user/dashboard/wallet');
        }
    }), [user, authLoading]

    const form = useForm<CreateProductFormValues>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            category: "",
        },
    });

    const handlePdfSelect = (file: File) => {
        setPdfFile(file);
    };

    const clearPdfFile = () => {
        setPdfFile(null);
    };

    const onSubmit = async (data: CreateProductFormValues) => {
        if (!image) {
            setError("Please upload a product image");
            return;
        }

        if (!pdfFile) {
            setError("Please upload a PDF file for your product");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
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
                    
                    imageUrl = imageUploadResponse.data.imageUrl || `http://localhost:3000/uploads/${imageUploadResponse.data.filename}`;
                } else {
                    imageUrl = image;
                }
            }

            const pdfFormData = new FormData();
            pdfFormData.append('file', pdfFile);
            
            const pdfUploadResponse = await api.post('/upload/', pdfFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            const pdfUrl = pdfUploadResponse.data.fileUrl || `http://localhost:3000/uploads/${pdfUploadResponse.data.filename}`;

            const productData = {
                title: data.title,
                description: data.description,
                price: data.price,
                imageUrl: imageUrl,
                fileUrl: pdfUrl,
                categories: [
                    {
                    name: data.category,
                }
            ]
            };
            
            await api.post('/listing', productData);
            
            setSuccess(true);
            form.reset();
            setPdfFile(null);
            
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
            
        } catch (err: any) {
            console.error("Error creating product:", err);
            setError(err.response?.data?.message || "Failed to create product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-6">
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Product Image</h2>
                        <ImageResizer />
                    </div>
                    
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
                        {!pdfFile ? (
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
                                                <p className="text-xs text-gray-500">
                                                    {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
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
                                    <Badge variant="outline" className="mt-2 bg-green-50 text-green-700 border-green-200">
                                        PDF Ready to Upload
                                    </Badge>
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
                                    <AlertDescription>Product created successfully! Redirecting...</AlertDescription>
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
                                        disabled={isLoading || !image || !pdfFile}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : "Create Product"}
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

export default CreateProductForm;