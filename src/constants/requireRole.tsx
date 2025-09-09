
"use client";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireRole({ children, allow }: { children: React.ReactNode, allow: string[] }) {
    const router = useRouter();
    useEffect(() => {
        const role = getCookie("role");
        if (!role || !allow.includes(role as string)) {
            router.replace("/not-authorized");
        }
    }, [router, allow]);
    return <>{children}</>;
}