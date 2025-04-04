'use client'

import { useAuth } from "@/providers/authprovider";
import { use } from "react";

function User({ params }: { params: Promise<{ id: string }> }) {
    const { user } = useAuth();
    const resolvedParams = use(params);
    const userId = resolvedParams.id;
    
    return (
        <div>
            {user && user.id === userId ? (
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-3xl font-bold mb-4">Welcome, {user.name}!</h1>
                    <p className="text-lg">This is your profile page.</p>
                    <p className="text-lg">User ID: {user.id}</p>
                    <p className="text-lg">Email: {user.email}</p>
                    <p className="text-lg">Stripe Status: {user.stripeStatus}</p>
                    <p className="text-lg">Created At: {new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-screen">
                    <h1 className="text-3xl font-bold mb-4">This is not your profile</h1>
                </div>
            )}
        </div>
    );
}

export default User;