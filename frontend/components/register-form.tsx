'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import * as z from 'zod';
import { useEffect, useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, Controller } from "react-hook-form"
import Link from "next/link"

/**
 * Zod validation schema for user registration
 * Validates all required fields with appropriate constraints
 * Includes custom validation for password matching and terms acceptance
 */
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions"
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Displays error on the confirmPassword field
});

// Type inference from Zod schema for form values
type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * RegisterForm component handles new user registration
 * Provides form with validation for creating user accounts
 * Includes validation for all fields and redirects on successful registration
 * 
 * @param {object} props - Component props including className and HTML div attributes
 */
export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // State for tracking form submission and errors
  const [isLoading, setIsLoading] = useState(false); // Controls button loading state
  const [error, setError] = useState<string | null>(null); // Stores registration error messages
  
  // Get authentication utilities and user state from context
  const { user, register: registerUser } = useAuth();
  
  // Next.js router for navigation after registration
  const router = useRouter();

  /**
   * Effect to redirect authenticated users away from registration page
   * Prevents logged-in users from seeing the registration form
   */
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);
  
  /**
   * Initialize form with react-hook-form and Zod validation
   * Sets up validation, error handling, and default values for all fields
   */
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  /**
   * Form submission handler that processes registration
   * Makes API call to create a new user account
   * Handles success/error states and redirects on completion
   * 
   * @param {RegisterFormValues} data - Validated form data
   */
  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call authentication provider's register method with form data
      await registerUser({
        "name": data.name, 
        "surname": data.surname, 
        "email": data.email, 
        "password": data.password
      });
      // Successful registration will trigger the useEffect to redirect
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Registration form with validation */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* Error message display */}
              {error && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              {/* First name input field */}
              <div className="grid gap-3">
                <Label htmlFor="name">First Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John"
                  {...register("name")}
                  aria-invalid={errors.name ? "true" : "false"}
                />
                {/* Field-specific validation error */}
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              {/* Last name input field */}
              <div className="grid gap-3">
                <Label htmlFor="surname">Last Name</Label>
                <Input
                  id="surname"
                  type="text"
                  placeholder="Doe"
                  {...register("surname")}
                  aria-invalid={errors.surname ? "true" : "false"}
                />
                {/* Field-specific validation error */}
                {errors.surname && (
                  <p className="text-sm text-red-500">{errors.surname.message}</p>
                )}
              </div>
              
              {/* Email input field */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@example.com"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {/* Field-specific validation error */}
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              {/* Password input field */}
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                {/* Field-specific validation error */}
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
              
              {/* Confirm password input field */}
              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword")}
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                {/* Field-specific validation error */}
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
              
              {/* Terms and conditions checkbox */}
              <div className="flex items-start space-x-2 mt-2">
                <Controller
                  name="acceptTerms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="acceptTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I accept the <Link href="/terms" className="text-blue-600 hover:underline">terms and conditions</Link>
                  </label>
                  {/* Field-specific validation error */}
                  {errors.acceptTerms && (
                    <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
                  )}
                </div>
              </div>
              
              {/* Submit button with loading state */}
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Register"}
                </Button>
              </div>
            </div>
            
            {/* Login link for existing users */}
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}