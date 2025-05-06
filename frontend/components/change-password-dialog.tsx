'use client';
import { useState } from "react";
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Alert, AlertDescription } from "./ui/alert";
import { Loader2, Lock } from "lucide-react";

/**
 * Zod schema for password change form validation
 * Validates current password, new password, and confirmation match
 * Enforces minimum password strength requirements
 */
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password confirmation is required" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirm password must match",
  path: ["confirmPassword"],
});

// Type inference for form values based on the Zod schema
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

/**
 * Props interface for the ChangePasswordDialog component
 * Supports both controlled and uncontrolled dialog state patterns
 */
interface ChangePasswordDialogProps {
  open?: boolean;                        // Optional controlled open state
  onOpenChange?: (open: boolean) => void; // Optional handler for open state changes
}

/**
 * ChangePasswordDialog component allows users to securely change their password
 * Provides form validation, error handling, and success confirmation
 * Can be used as either a controlled or uncontrolled component
 * 
 * @param {ChangePasswordDialogProps} props - Component props
 */
function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  // Get authenticated user data from context
  const { user } = useAuth();
  
  // State management for form feedback and dialog control
  const [passwordError, setPasswordError] = useState<string | null>(null); // Error message if password change fails
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null); // Success message after password change
  const [changingPassword, setChangingPassword] = useState(false); // Loading state during API call
  const [dialogOpen, setDialogOpen] = useState(false); // Internal dialog state for uncontrolled usage

  /**
   * Handle either controlled or uncontrolled dialog state
   * If props.open is provided, use that (controlled)
   * Otherwise use internal state (uncontrolled)
   */
  const isOpen = open !== undefined ? open : dialogOpen;
  const setIsOpen = onOpenChange || setDialogOpen;

  /**
   * Initialize password change form with Zod validation schema
   * Set up default empty values for form fields
   */
  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  /**
   * Handler for password change form submission
   * Makes API call to change user password
   * Shows appropriate success/error messages and resets form on completion
   * 
   * @param {PasswordChangeFormValues} data - Validated form data
   */
  const onPasswordChange = async (data: PasswordChangeFormValues) => {
    // Skip if user information is not available
    if (!user?.id || !user?.email) return;
    
    // Set up UI state for submission
    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    
    try {
      // Make API request to change password
      await api.post(`/auth/change-password`, {
        email: user.email,
        password: data.currentPassword,
        newPassword: data.newPassword
      });
      
      // Handle successful password change
      setPasswordSuccess("Password changed successfully");
      passwordForm.reset(); // Clear form fields
      
      // Auto-close dialog after successful password change
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
      
    } catch (err) {
      console.error("Error changing password:", err);
      setPasswordError("Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Dialog trigger button - only shown in uncontrolled mode */}
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="outline"
        >
          <Lock className="mr-2 h-4 w-4" />
          Change Password
        </Button>
      </DialogTrigger>
      
      {/* Dialog content with password change form */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password below.
          </DialogDescription>
        </DialogHeader>
        
        {/* Error message shown if password change fails */}
        {passwordError && (
          <Alert variant="destructive">
            <AlertDescription>{passwordError}</AlertDescription>
          </Alert>
        )}
        
        {/* Success message shown after successful password change */}
        {passwordSuccess && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{passwordSuccess}</AlertDescription>
          </Alert>
        )}
        
        {/* Password change form with validation */}
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
            {/* Current password field */}
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* New password field */}
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Confirm new password field */}
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Form submission button with loading state */}
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={changingPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Changing...
                  </>
                ) : "Change Password"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePasswordDialog;