"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/layout/AuthProvider";

export default function Home() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      window.location.href = user ? "/dashboard" : "/login";
    }
  }, [user, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );
}
