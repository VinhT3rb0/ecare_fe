"use client";
import { AppStore, makeStore } from "@/lib/store";
import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { getAccessTokenFromCookie } from "@/utils/token";
import { apiDoctor } from "@/api/app_doctor/apiDoctor";
import { getCookie } from "cookies-next";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const storeRef = useRef<AppStore | null>(null);
    if (!storeRef.current) {
        storeRef.current = makeStore();
    }
    const role = getCookie("role");
    useEffect(() => {
        if (role === "doctor") {
            const token = getAccessTokenFromCookie();
            if (!token) return;
            try {
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace("-", "+").replace("_", "/");
                const payload = JSON.parse(atob(base64));
                const userId = payload?.user_id || payload?.sub || payload?.id;
                if (userId && storeRef.current) {
                    storeRef.current.dispatch(
                        apiDoctor.endpoints.getMyDoctor.initiate(String(userId), { forceRefetch: false })
                    );
                }
            } catch {
                // ignore decode errors
            }
        }
    }, [role]);
    return <Provider store={storeRef.current}>{children}</Provider>;
}
