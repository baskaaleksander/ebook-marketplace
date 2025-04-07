'use client';
import { Order, Payout } from "@/lib/definitions";
import { useAuth } from "@/providers/authprovider";
import { useRouter } from "next/navigation";
import { use, useState } from "react";

function SettingsPage() {

    const { user } = useAuth();
    const router = useRouter();


  return (
  <div>Settings {user.id}</div>);
}

export default SettingsPage;