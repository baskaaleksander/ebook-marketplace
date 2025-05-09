'use client';
import { UserData } from "@/lib/definitions";
import { useAuth } from "@/providers/auth-provider";
import api from "@/utils/axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import * as z from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChangeAvatarDialog from "@/components/change-avatar-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChangePasswordDialog from "@/components/change-password-dialog";

/**
 * Zod schema for validating user settings form data
 * Defines validation rules for name, surname, email, and optional fields
 */
const userSettingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
});

// Type inference for form values based on the Zod schema
type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

/**
 * Settings component handles user account settings and profile management
 * Allows users to update profile info, change avatar, change password, and delete account
 */
function Settings() {
  // Authentication context for current user data and logout function
  const { user, loading: authLoading, logout } = useAuth();
  
  // State management for user data and UI states
  const [userData, setUserData] = useState<UserData>(); // Current user profile information
  const [error, setError] = useState<string | null>(null); // Error message for operations
  const [success, setSuccess] = useState<string | null>(null); // Success message for operations
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch
  const [submitting, setSubmitting] = useState(false); // Loading state for form submissions
  
  // Dialog visibility states
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false); // Controls password change dialog
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false); // Controls avatar change dialog
  const [deleteAccountDialogOpen, setDeleteAccountDialogOpen] = useState(false); // Controls account deletion dialog
  
  // Account deletion confirmation state
  const [deleteMyAccount, setDeleteMyAccount] = useState<string>(""); // Confirmation text input
  const [deleteButtonDisabled, setDeleteButtonDisabled] = useState(true); // Disables delete button until confirmed
  
  const router = useRouter();
  
  /**
   * Initialize form with Zod validation schema and default empty values
   * Will be populated with user data once fetched
   */
  const form = useForm<UserSettingsFormValues>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      name: "",
      surname: "",
      email: "",
      description: "",
      avatarUrl: "",
    },
  });
  
  /**
   * Effect to check authentication and redirect to login if not authenticated
   * Ensures settings page is only accessible to logged-in users
   */
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  /**
   * Effect to fetch user profile data when component mounts
   * Populates the form with current user information
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        // Fetch user profile data from API
        const response = await api.get(`/user/${user.id}`);
        const fetchedUser = response.data;
        
        // Update state with fetched user data, adding a fallback for missing avatar
        setUserData({
          ...fetchedUser,
          avatarUrl: fetchedUser.avatarUrl || `https://ui-avatars.com/api/?name=${fetchedUser.name}+${fetchedUser.surname}&bold=true`,
        });
        
        // Pre-populate form fields with user data
        form.reset({
          name: fetchedUser.name,
          surname: fetchedUser.surname,
          email: fetchedUser.email,
          description: fetchedUser.description || "",
          avatarUrl: fetchedUser.avatarUrl || "",
        });
      } 
      catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load user data");
      }
      finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, authLoading, form]);

  /**
   * Effect to enable/disable delete account button based on confirmation text
   * Requires exact match of "delete my account" to enable the button
   */
  useEffect(() => {
    if (deleteMyAccount === "delete my account") {
      setDeleteButtonDisabled(false);
    } else {
      setDeleteButtonDisabled(true);
    }
  }, [deleteMyAccount]);

  /**
   * Handler for avatar change from the dialog
   * Updates local state and form value with new avatar URL
   * 
   * @param {string} newAvatarUrl - URL of the new avatar image
   */
  const onAvatarChange = (newAvatarUrl: string) => {
    try {
      if (!user?.id) return;
      
      // Update local user data with new avatar URL
      setUserData(prev => prev ? {
        ...prev,
        avatarUrl: newAvatarUrl,
      } : undefined);

      // Update form value to include new avatar
      form.setValue('avatarUrl', newAvatarUrl);
      
      setSuccess("Profile picture updated successfully");
    }
    catch (error) {
      console.error("Error changing avatar:", error);
      setError("Failed to change avatar");
    }
    finally {
      setAvatarDialogOpen(false);
    }
  }

  /**
   * Handler for account deletion
   * Makes API call to delete the user account and handles logout/redirect
   */
  const onDeleteAccount = async () => {
    try {
      if (!user?.id) return;
      
      // Delete user account via API
      await api.delete(`/user/${user.id}`);
      setSuccess("Account deleted successfully");
    }
    catch (error) {
      console.error("Error deleting account:", error);
      setError("Failed to delete account");
    }
    finally {
      // Close dialog, log out user, and redirect to login page
      setDeleteAccountDialogOpen(false);
      logout();
      router.push('/login');
    }
  }

  /**
   * Handler for form submission to update user profile
   * Makes API call to update user data with form values
   * 
   * @param {UserSettingsFormValues} data - Validated form data
   */
  const onSubmit = async (data: UserSettingsFormValues) => {
    if (!user?.id) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update user profile via API
      await api.patch(`/user/${user.id}`, data);
      setSuccess("Profile updated successfully");
      
      // Update local user data state with new values
      setUserData(prev => prev ? {
        ...prev,
        ...data,
        avatarUrl: data.avatarUrl || prev.avatarUrl,
      } : undefined);
      
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };
  
  // Show loading spinner while fetching initial data
  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Account Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Alert messages for errors and success notifications */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          {/* User avatar display with edit button */}
          <div className="flex items-center space-x-4 mb-8">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userData?.avatarUrl} alt={userData?.name} />
                <AvatarFallback>
                  {userData?.name?.[0]}{userData?.surname?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1">
                <Button 
                  type="button"
                  variant="outline" 
                  size="icon"
                  className="h-8 w-8 rounded-full border shadow-sm"
                  onClick={() => setAvatarDialogOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium">{userData?.name} {userData?.surname}</h3>
              <p className="text-muted-foreground text-sm">{userData?.email}</p>
            </div>
          </div>

          {/* Avatar change dialog component */}
          {userData && (
            <ChangeAvatarDialog 
              open={avatarDialogOpen}
              onOpenChange={setAvatarDialogOpen}
              currentAvatarUrl={userData.avatarUrl}
              userName={userData.name}
              userSurname={userData.surname}
              onAvatarChange={onAvatarChange}
            />
          )}
          
          {/* User settings form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name and surname fields in a two-column layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Email field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Bio/description field */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us about yourself" 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Form action buttons */}
              <div className="flex justify-between items-center">
                {/* Password change dialog component */}
                <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
                
                {/* Save changes button with loading state */}
                <Button 
                  type="submit" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : "Save Changes"}
                </Button>
              </div>

              {/* Delete account section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex flex-col">
                  <h3 className="text-lg font-medium text-red-600 mb-2">Delete your account</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setDeleteAccountDialogOpen(true)}
                    className="w-full md:w-auto md:self-start"
                    disabled={submitting}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>

              {/* Account deletion confirmation dialog */}
              <Dialog open={deleteAccountDialogOpen} onOpenChange={setDeleteAccountDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-red-600">Delete Your Account</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. This will permanently delete your account and remove all of your data from our servers.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4">
                    <p className="font-medium mb-2">Are you absolutely sure you want to delete your account?</p>
                    <p className="text-sm text-gray-500">Please type &quot;delete my account&quot; to delete your account.</p>
                    <Input 
                      className="mt-2"
                      placeholder="delete my account"
                      onChange={(e) => setDeleteMyAccount(e.target.value)}
                      value={deleteMyAccount}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteAccountDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => {
                        onDeleteAccount();
                      }}
                      disabled={deleteButtonDisabled}
                    >
                      Delete My Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Settings;