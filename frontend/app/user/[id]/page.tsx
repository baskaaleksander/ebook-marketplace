'use server';
import api from "@/utils/axios";
import User from "./user";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    try {
        const resolvedParams = await params;
        const userId = resolvedParams.id;
        const response = await api.get(`/user/${userId}`);
        const user = response.data;

        return {
            title: `${user.name} ${user.surname} profile | bookify`,
            description: user.description?.slice(0, 160) || "User description",
            openGraph: {
                title: user.name,
                description: user.description?.slice(0, 160) || "User description",
                images: user.profileImageUrl ? [user.profileImageUrl] : [],
            },
        };
    }
    catch (error) {
        console.error("Error fetching user metadata:", error);
        return {
            title: "User | bookify",
            description: "User details page",
        };
    }
}


export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {

  return (
    <User params={params} />
  );
}