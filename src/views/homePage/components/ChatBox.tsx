"use client";
import React, { useEffect, useRef, useState } from "react";
import { Badge, Button, Image, Input, Upload, message as antdMessage } from "antd";
import {
    MessageOutlined,
    SendOutlined,
    MinusOutlined,
    CloseOutlined,
    PaperClipOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";
import {
    useGetConversationQuery,
    useSendMessageMutation,
} from "@/api/app_chat/apiChatbox";

const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
    withCredentials: true,
    transports: ["websocket", "polling"],
});

// helper cookie
const getCookie = (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const v = `; ${document.cookie}`;
    const parts = v.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
    return null;
};

interface ChatMessage {
    id?: string | number;
    from: string;
    text?: string;
    type: "text" | "image" | "file";
    url?: string;
    createdAt: string;
}

const ChatBox: React.FC = () => {
    const [visible, setVisible] = useState(false);
    const [minimized, setMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [uploading, setUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [hasUnread, setHasUnread] = useState(false);
    const idUser = getCookie("idUser") || ""; // patient id
    const adminId = "2";

    // RTK Query
    const { data: conversationData } = useGetConversationQuery(
        { userId1: idUser, userId2: adminId },
        { skip: !idUser }
    );
    const [sendMessageMutation] = useSendMessageMutation();

    // map DB -> UI
    useEffect(() => {
        if (!conversationData) return;
        const mapped: ChatMessage[] = conversationData.map((m: any) => ({
            id: m.id,
            from: String(m.sender_id) === String(idUser) ? "patient" : "admin",
            text: m.message_type === "text" ? m.message : undefined,
            type: m.message_type || "text",
            url: m.message_type === "text" ? undefined : m.message,
            createdAt: m.created_at,
        }));
        setMessages(mapped);
        setTimeout(() => scrollToBottom(), 50);
    }, [conversationData]);

    // socket receive
    useEffect(() => {
        if (!idUser) return;
        const role = getCookie("role") || "patient";

        const onConnect = () => {
            socket.emit("join_room", { role, idUser });
        };

        const onReceive = (data: any) => {
            // 1) Chuẩn hoá type trước
            const rawType = data.message_type;
            const normType: ChatMessage["type"] =
                rawType === "text" || rawType === "image" || rawType === "file"
                    ? rawType
                    : data.url
                        ? (/\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(data.url) ? "image" : "file")
                        : "text";

            // 2) Dựa vào normType để set text/url
            const normalized: ChatMessage = {
                id: data.id,
                from: data.fromRole === "patient" ? "patient" : "admin",
                type: normType,
                text: normType === "text" ? (data.text ?? data.message ?? "") : undefined,
                url: normType !== "text" ? (data.url ?? data.message ?? "") : undefined,
                createdAt: data.createdAt ?? data.created_at ?? new Date().toISOString(),
            };

            // 3) Chống trùng (nếu server chưa trả id thì so theo createdAt+text)
            setMessages((prev) => {
                const exists = normalized.id
                    ? prev.some((p) => String(p.id) === String(normalized.id))
                    : prev.some((p) => p.createdAt === normalized.createdAt && (p.text ?? "") === (normalized.text ?? ""));
                if (exists) return prev;
                return [...prev, normalized];
            });

            // 4) Badge đỏ khi có tin mới từ admin mà widget đang đóng/thu nhỏ
            if ((!visible || minimized) && normalized.from === "admin") {
                setHasUnread(true);
            }

            setTimeout(() => scrollToBottom(), 10);
        };

        socket.on("connect", onConnect);
        socket.on("receive_private_message", onReceive);
        if (socket.connected) onConnect();

        return () => {
            socket.off("connect", onConnect);
            socket.off("receive_private_message", onReceive);
        };
    }, [idUser, visible, minimized]);


    // scroll
    const scrollToBottom = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    };

    // send text
    const handleSendText = async () => {
        if (!inputValue.trim() || !idUser) return;

        const formData = new FormData();
        formData.append("sender_id", String(idUser));
        formData.append("receiver_id", adminId);
        formData.append("message", inputValue.trim());
        formData.append("message_type", "text");

        try {
            const res: any = await sendMessageMutation(formData).unwrap();
            const saved = res?.data || res;
            const payload = {
                fromUserId: saved.sender_id,
                toUserId: saved.receiver_id,
                text: saved.message,
                fromRole: "patient",
                message_type: "text",
                id: saved.id,
                createdAt: saved.created_at || new Date().toISOString(),
            };
            socket.emit("send_private_message", payload);
            setInputValue("");
        } catch {
            antdMessage.error("Gửi thất bại");
        }
    };

    // upload file
    const handleUploadCustom = async (options: any) => {
        const { file, onSuccess, onError } = options;
        if (!idUser) {
            onError("No user");
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append("sender_id", String(idUser));
        formData.append("receiver_id", adminId);
        formData.append("file", file);
        try {
            const res: any = await sendMessageMutation(formData).unwrap();
            const saved = res?.data || res;
            const payload = {
                fromUserId: saved.sender_id,
                toUserId: saved.receiver_id,
                fromRole: "patient",
                message_type: saved.message_type,
                id: saved.id,
                createdAt: saved.created_at || new Date().toISOString(),
                url: saved.message,
            };
            socket.emit("send_private_message", payload);
            onSuccess(saved);
        } catch (err) {
            onError(err);
            antdMessage.error("Upload thất bại");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div style={{ position: "fixed", bottom: 100, right: 20 }}>
                <Button
                    type="primary"
                    shape="circle"
                    size="large"
                    icon={<MessageOutlined />}
                    style={{ backgroundColor: "#11A998", border: "none" }}
                    onClick={() => {
                        setVisible(!visible);
                        setMinimized(false);
                        setHasUnread(false);
                    }}
                />
                {hasUnread && (
                    <span
                        style={{
                            position: "absolute",
                            top: -2,
                            right: -2,
                            width: 12,
                            height: 12,
                            backgroundColor: "red",
                            borderRadius: "50%",
                            border: "2px solid white",
                        }}
                    />
                )}
            </div>
            {visible && (
                <div
                    style={{
                        position: "fixed",
                        bottom: 20,
                        right: 20,
                        width: 360,
                        height: minimized ? 60 : 520,
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        transition: "height 0.25s ease",
                    }}
                >
                    {/* Header */}
                    <div
                        style={{
                            background: "#11A998",
                            color: "white",
                            padding: "10px 12px",
                            fontWeight: 700,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>Hỗ trợ trực tuyến</div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <Button
                                size="small"
                                type="text"
                                icon={<MinusOutlined />}
                                onClick={() => setMinimized(!minimized)}
                                style={{ color: "white" }}
                            />
                            <Button
                                size="small"
                                type="text"
                                icon={<CloseOutlined />}
                                onClick={() => setVisible(false)}
                                style={{ color: "white" }}
                            />
                        </div>
                    </div>

                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            padding: 12,
                            overflowY: "auto",
                            background: "#f6f7f9",
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        {messages.map((m) => (
                            <div
                                key={`${m.id ?? m.createdAt ?? m.text}`}
                                style={{
                                    display: "flex",
                                    justifyContent: m.from === "patient" ? "flex-end" : "flex-start",
                                }}
                            >
                                <div
                                    style={{
                                        background: m.from === "patient" ? "#11A998" : "#e4e6eb",
                                        color: m.from === "patient" ? "#fff" : "#000",
                                        padding: 10,
                                        borderRadius: 10,
                                        maxWidth: 260,
                                        wordBreak: "break-word",
                                    }}
                                >
                                    {m.type === "text" && <div>{m.text}</div>}
                                    {m.type === "image" && (
                                        <Image
                                            src={m.url}
                                            alt="img"
                                            style={{ maxWidth: "220px", borderRadius: 8, display: "block" }}
                                        />
                                    )}
                                    {m.type === "file" && (
                                        <a
                                            href={m.url}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            style={{
                                                color: m.from === "patient" ? "#fff" : "#000",
                                                textDecoration: "underline",
                                            }}
                                        >
                                            📎 Tải file
                                        </a>
                                    )}
                                    <div
                                        style={{
                                            fontSize: 11,
                                            opacity: 0.8,
                                            marginTop: 4,
                                            textAlign: m.from === "patient" ? "right" : "left",
                                        }}
                                    >
                                        {new Date(m.createdAt).toLocaleDateString("vi-VN", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}{" "}
                                        {new Date(m.createdAt).toLocaleTimeString("vi-VN", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    {!minimized && (
                        <div
                            style={{
                                padding: 8,
                                borderTop: "1px solid #eee",
                                display: "flex",
                                gap: 8,
                                alignItems: "center",
                            }}
                        >
                            <Upload
                                customRequest={handleUploadCustom}
                                showUploadList={false}
                                disabled={uploading}
                                accept="image/*,application/pdf,.doc,.docx"
                            >
                                <Button
                                    icon={<PaperClipOutlined />}
                                    style={{ border: "none", background: "transparent" }}
                                />
                            </Upload>

                            <Input
                                placeholder="Nhập tin nhắn..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPressEnter={handleSendText}
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={handleSendText}
                                style={{
                                    background: "#11A998",
                                    border: "none",
                                }}
                                disabled={uploading}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatBox;
