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
import { Loader2, Upload } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChangePasswordDialog from "@/components/change-password-dialog";
import ChangeAvatarDialog from "@/components/change-avatar-dialog";

const userSettingsSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  surname: z.string().min(2, { message: "Surname must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  description: z.string().optional(),
  avatarUrl: z.string().optional(),
});


type UserSettingsFormValues = z.infer<typeof userSettingsSchema>;

function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<UserData>();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
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
  

  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      try {
        const response = await api.get(`/user/${user.id}`);
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

  const onAvatarChange = (newAvatarUrl: string) => {
    try {
      if (!user?.id) return;
      
      setUserData(prev => prev ? {
        ...prev,
        avatarUrl: newAvatarUrl,
      } : undefined);

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
                <ChangePasswordDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen} />
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