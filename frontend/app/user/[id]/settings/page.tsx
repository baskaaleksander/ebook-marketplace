'use client';
import { Order, Payout } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

function SettingsPage({ params }: { params: Promise<{ id: string }> }) {

    const { user } = useAuth();
    const resolvedParams = use(params);
    const userId = resolvedParams.id;
    const router = useRouter();

    if(userId !== user?.id) {
      router.push('/')
    }

  return (
  <div>Settings {userId}</div>);
}

export default SettingsPage;