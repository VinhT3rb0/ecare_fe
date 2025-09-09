"use client";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

export type ChatMessage = {
    fromUserId: string;
    toUserId: string;
    text: string;
    fromRole: "admin" | "patient";
    createdAt?: string;
};

export function useAdminChat(adminId: string) {
    const socket = getSocket();
    const [patientsOnline, setPatientsOnline] = useState<string[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const joinedRef = useRef(false);

    useEffect(() => {
        if (!adminId) return;
        if (!joinedRef.current) {
            // admin joins with its userId & role
            socket.emit("join_room", { userId: adminId, role: "admin" });
            joinedRef.current = true;
        }

        const onPatients = (list: string[]) => {
            setPatientsOnline(list || []);
        };

        const onReceive = (msg: ChatMessage) => {
            // push toàn bộ tin nhắn private đến admin (filter khi render)
            setMessages((prev) => [...prev, msg]);
        };

        socket.on("patients_online", onPatients);
        socket.on("receive_private_message", onReceive);

        return () => {
            socket.off("patients_online", onPatients);
            socket.off("receive_private_message", onReceive);
        };
    }, [adminId, socket]);

    const sendPrivateMessage = (toUserId: string, text: string) => {
        if (!toUserId || !text.trim()) return;
        const msg: ChatMessage = {
            fromUserId: adminId,
            toUserId,
            text,
            fromRole: "admin",
            createdAt: new Date().toISOString(),
        };
        // emit tới server
        socket.emit("send_private_message", msg);
        // cập nhật UI ngay
        setMessages((prev) => [...prev, msg]);
    };

    return { patientsOnline, messages, sendPrivateMessage };
}
