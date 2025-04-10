'use client';
import { UserData } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
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
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const userSettingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password confirmation is required" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New password and confirm password must match",
  path: ["confirmPassword"],
});

type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;
type PasswordChangeFormValues = z.infer<typeof passwordChangeSchema>;

function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserData>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const router = useRouter();
  
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
  
  const passwordForm = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await api.get(`/user/id/${user.id}`);
        const fetchedUser = response.data;
        
        setUserData({
          ...fetchedUser,
          avatarUrl: fetchedUser.avatarUrl || `https://ui-avatars.com/api/?name=${fetchedUser.name}+${fetchedUser.surname}&bold=true`,
        });
        
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

  const onSubmit = async (data: UserSettingsFormValues) => {
    if (!user?.id) return;
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      await api.put(`/user/${user.id}`, data);
      setSuccess("Profile updated successfully");
      
      setUserData(prev => prev ? {
        ...prev,
        ...data,
        avatarUrl: data.avatarUrl || prev.avatarUrl,
      } : undefined);
      
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };
  
  const onPasswordChange = async (data: PasswordChangeFormValues) => {
    if (!user?.id) return;
    
    setChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    
    // FIX: not working
    try {
      await api.post(`/auth/change-password`, {
        email: user.email,
        password: data.currentPassword,
        newPassword: data.newPassword
      });
      
      setPasswordSuccess("Password changed successfully");
      passwordForm.reset();
      
      setTimeout(() => {
        setPasswordDialogOpen(false);
      }, 2000);
      
    } catch (err: any) {
      console.error("Error changing password:", err);
      setPasswordError(err?.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
// to be splitted 
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
          
          <div className="flex items-center space-x-4 mb-8">
            <Avatar className="h-20 w-20">
              <AvatarImage src={userData?.avatarUrl} alt={userData?.name} />
              <AvatarFallback>
                {userData?.name?.[0]}{userData?.surname?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{userData?.name} {userData?.surname}</h3>
              <p className="text-muted-foreground text-sm">{userData?.email}</p>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              
              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar URL</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://example.com/avatar.jpg" />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for your profile picture
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
              
              <div className="flex justify-between items-center">
                <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      type="button" 
                      variant="outline"
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and a new password below.
                      </DialogDescription>
                    </DialogHeader>
                    
                    {passwordError && (
                      <Alert variant="destructive">
                        <AlertDescription>{passwordError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {passwordSuccess && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <AlertDescription>{passwordSuccess}</AlertDescription>
                      </Alert>
                    )}
                    
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordChange)} className="space-y-4">
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
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

export default SettingsPage;