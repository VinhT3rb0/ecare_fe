
"use client";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    const token = getCookie("access_token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);
  return <>{children}</>;
}