'use client'
import { useAuth } from "@/providers/authprovider"
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
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

const createProductSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters" }),
    description: z.string().min(2, { message: "Description must be at least 2 characters" }),
    price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
    category: z.string().min(1, { message: "Please select a category" }),
});

type CreateProductFormValues = z.infer<typeof createProductSchema>;

const categories = [
  { id: "fiction", name: "Fiction" },
  { id: "nonfiction", name: "Non-Fiction" },
  { id: "educationandprofessional", name: "Education & Professional" },
  { id: "creativeandlifestyle", name: "Creative & Lifestyle" },
  { id: "graphics", name: "Graphics & Design" },
];

function CreateProductForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const { image, setImage } = useImage()

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router])

    const form = useForm<CreateProductFormValues>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            category: "",
        },
    });

    const onSubmit = async (data: CreateProductFormValues) => {
        if (!image) {
            setError("Please upload a product image");
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            
            const formData = new FormData();
            formData.append('title', data.title);
            formData.append('description', data.description);
            formData.append('price', data.price.toString());
            formData.append('category', data.category);
            
            if (image.startsWith('data:')) {
                const response = await fetch(image);
                const blob = await response.blob();
                const file = new File([blob], "product-image.jpg", { type: "image/jpeg" });
                formData.append('image', file);
            }
            
            // await api.post('/listing', formData, {
            //     headers: {
            //         'Content-Type': 'multipart/form-data',
            //     }
            // });
            
            console.log("Form Data:", formData);

            setSuccess(true);
            form.reset();
            setImage(null);
            
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
                                        disabled={isLoading || !image}
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

    );
}

export default CreateProductForm;