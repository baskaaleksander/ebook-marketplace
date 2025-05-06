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

/**
 * Zod validation schema for product creation form
 * Defines validation rules and error messages for all required fields
 */
const createProductSchema = z.object({
    title: z.string().min(2, { message: "Title must be at least 2 characters" }),
    description: z.string().min(2, { message: "Description must be at least 2 characters" }),
    price: z.coerce.number().min(0, { message: "Price must be a positive number" }),
    category: z.string().min(1, { message: "Please select a category" }),
});

// Type inference for form values based on the Zod schema
type CreateProductFormValues = z.infer<typeof createProductSchema>;

/**
 * Predefined list of available product categories
 * Used to populate the category selection dropdown
 */
const categories = [
  { id: "Fiction", name: "Fiction" },
  { id: "nonfiction", name: "Non-Fiction" },
  { id: "educationandprofessional", name: "Education & Professional" },
  { id: "creativeandlifestyle", name: "Creative & Lifestyle" },
];

/**
 * CreateProductForm component handles the creation of new e-book products
 * Includes form validation, file uploads, image processing, and API integration
 * Requires authenticated user with verified Stripe account
 */
function CreateProductForm() {
    // Form submission and UI state
    const [isLoading, setIsLoading] = useState(false); // Controls button loading state
    const [error, setError] = useState<string | null>(null); // Tracks form/API errors
    const [success, setSuccess] = useState<boolean>(false); // Tracks successful submission
    const [pdfFile, setPdfFile] = useState<File | null>(null); // Stores the uploaded PDF file
    
    // Navigation and context hooks
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { image } = useImage(); // Product cover image from ImageProvider context

    /**
     * Effect to check authentication and redirect to login if not authenticated
     * Prevents unauthorized access to product creation
     */
    useEffect(() => {
        if (!authLoading && !user) { 
            router.push('/login');
        }
    }, [user, authLoading, router]);

    /**
     * Effect to verify user has a connected Stripe account
     * Redirects to wallet/Stripe onboarding if account isn't verified
     * This ensures users complete Stripe verification before creating products
     */
    useEffect(() => {
        if (authLoading) return;
        
        const fetchUserData = async () => {
            if (!user) return;
            try {
                const response = await api.get('/auth/me');
                const user = await api.get(`/user/${response.data}`);
                
                if(user.data.stripeStatus !== 'verified') {
                    router.push('/user/dashboard/wallet');
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to load user data");
            }
        };

        fetchUserData();

    }, [user, authLoading]);

    /**
     * Initialize form with Zod validation schema and default empty values
     * Form fields include title, description, price, and category
     */
    const form = useForm<CreateProductFormValues>({
        resolver: zodResolver(createProductSchema),
        defaultValues: {
            title: "",
            description: "",
            price: 0,
            category: "",
        },
    });

    /**
     * Handler for PDF file selection from FileUploader
     * Updates state with the selected PDF file
     * 
     * @param {File} file - The selected PDF file
     */
    const handlePdfSelect = (file: File) => {
        setPdfFile(file);
    };

    /**
     * Removes the currently selected PDF file
     * Used when user wants to select a different file
     */
    const clearPdfFile = () => {
        setPdfFile(null);
    };

    /**
     * Form submission handler that processes all data and files
     * Uploads image and PDF, then creates product listing via API
     * Shows success/error messages and redirects on completion
     * 
     * @param {CreateProductFormValues} data - Validated form data
     */
    const onSubmit = async (data: CreateProductFormValues) => {
        // Validate required files are present
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
            
            // Process and upload product image
            let imageUrl = "";
            if (image) {
                if (image.startsWith('data:') || image.startsWith('blob:')) {
                    // Convert data URL/blob to file for upload
                    const response = await fetch(image);
                    const blob = await response.blob();
                    const imageFile = new File([blob], "product-image.jpg", { type: "image/jpeg" });
                    
                    const imageFormData = new FormData();
                    imageFormData.append('file', imageFile);
                    
                    // Upload image file to server
                    const imageUploadResponse = await api.post('/upload', imageFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        }
                    });
                    
                    // Extract image URL from response
                    imageUrl = imageUploadResponse.data.url || `http://localhost:3000/uploads/${imageUploadResponse.data.filename}`;
                } else {
                    // Image is already a URL, use as is
                    imageUrl = image;
                }
            }

            // Prepare and upload PDF file
            const pdfFormData = new FormData();
            pdfFormData.append('file', pdfFile);
            
            const pdfUploadResponse = await api.post('/upload/', pdfFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            // Extract PDF URL from response
            const pdfUrl = pdfUploadResponse.data.fileUrl || `http://localhost:3000/uploads/${pdfUploadResponse.data.filename}`;

            // Combine all data for product creation
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
            
            // Create product listing via API
            await api.post('/listing', productData);
            
            // Handle successful submission
            setSuccess(true);
            form.reset();
            setPdfFile(null);
            
            // Redirect to dashboard after short delay to show success message
            setTimeout(() => {
                router.push('/dashboard');
            }, 2000);
            
        } catch (err) {
            console.error("Error creating product:", err);
            setError("Failed to create product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Two-column layout on larger screens, single column on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left column: Image and PDF upload sections */}
                <div className="flex flex-col gap-6">
                    {/* Image upload section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Product Image</h2>
                        <ImageResizer />
                    </div>
                    
                    {/* PDF upload section */}
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Upload PDF</h2>
                        {/* Conditional rendering based on whether a file is selected */}
                        {!pdfFile ? (
                            <FileUploader
                                onFileSelect={handlePdfSelect}
                                accept="application/pdf"
                                maxSize={20} // 20MB max size
                                label="Drag & drop your PDF file here"
                            />
                        ) : (
                            // Display selected file details with option to remove
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
                
                {/* Right column: Product details form */}
                <div>
                    <Card>
                        <CardContent className="pt-6">
                            {/* Error message alert */}
                            {error && (
                                <Alert variant="destructive" className="mb-6">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}
                            
                            {/* Success message alert */}
                            {success && (
                                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                                    <AlertDescription>Product created successfully! Redirecting...</AlertDescription>
                                </Alert>
                            )}
                            
                            {/* Product details form */}
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
                                    
                                    {/* Description field - text area for longer content */}
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
                                    
                                    {/* Price and category fields in a grid layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Price field with dollar sign prefix */}
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
                                        
                                        {/* Category dropdown selection */}
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
                                    
                                    {/* Submit button - disabled when loading or required files missing */}
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