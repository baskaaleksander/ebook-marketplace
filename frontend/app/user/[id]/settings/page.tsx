'use client';
import { use } from "react";

function SettingsPage({ params }: { params: Promise<{ id: string }> }) {

    const resolvedParams = use(params);
    const userId = resolvedParams.id;

  return (
  <div>Settings {userId}</div>);
}

export default SettingsPage;