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
import * as z from 'zod';
import { useEffect, useState } from "react"
import { useAuth } from "@/providers/auth-provider"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

/**
 * Zod schema for login form validation
 * Validates email format and minimum password length
 * Used to ensure data integrity before submission
 */
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Type inference from Zod schema for form values
type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * LoginForm component handles user authentication
 * Provides email/password form with validation
 * Integrates with auth context for login functionality
 * 
 * @param {object} props - Component props including className and HTML div attributes
 */
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  // State for tracking form submission and errors
  const [isLoading, setIsLoading] = useState(false); // Controls button loading state
  const [error, setError] = useState<string | null>(null); // Stores login error messages
  
  // Get authentication utilities and user state from context
  const { login, user } = useAuth();
  
  // Next.js router for navigation after login
  const router = useRouter();

  /**
   * Effect to redirect authenticated users away from login page
   * Prevents logged-in users from seeing the login form
   */
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);
  
  /**
   * Initialize form with react-hook-form and Zod validation
   * Sets up validation, error handling, and default values
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * Form submission handler that processes login
   * Makes authentication call and handles success/error states
   * 
   * @param {LoginFormValues} data - Validated form data
   */
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Attempt login through auth provider
      await login(data.email, data.password);
      // Successful login will trigger the useEffect to redirect
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Login form with validation */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              {/* Error message display */}
              {error && (
                <div 
                className="bg-red-50 p-3 rounded-md border border-red-200 text-red-600 text-sm"
                data-testid="login-error"
                >
                  {error}
                </div>
              )}
              
              {/* Email input field */}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {/* Field-specific validation error */}
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>
              
              {/* Password input field with forgot password link */}
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
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
              
              {/* Submit button with loading state */}
              <div className="flex flex-col gap-3">
                <Button 
                  type="submit" 
                  className="w-full cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </div>
            
            {/* Registration link */}
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/register" className="underline underline-offset-4">
                Sign up
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}