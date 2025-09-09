"use client";
import React, { useEffect, useState, useRef } from "react";
import { List, Input, Button, Typography, Card, Upload, message as antdMessage, Image, Badge } from "antd";
import { io } from "socket.io-client";
import { SendOutlined, PaperClipOutlined, MessageOutlined } from "@ant-design/icons";
import {
    useGetConversationQuery,
    useGetAllConversationsQuery,
    useSendMessageMutation,
} from "@/api/app_chat/apiChatbox";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetPatientListQuery } from "@/api/app_home/apiAccount";

const socket = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
    withCredentials: true,
    transports: ["websocket", "polling"],
});

const { Title } = Typography;

interface ChatMessage {
    id?: string | number;
    sender_id: string;
    receiver_id: string;
    message: string;
    message_type: "text" | "image" | "file";
    created_at: string;
    fromRole: "admin" | "patient";
}

const getCookie = (name: string): string | null => {
    if (typeof window === "undefined") return null;
    const v = `; ${document.cookie}`;
    const parts = v.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()!.split(";").shift() || null;
    return null;
};

const AdminChat: React.FC = () => {
    const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [uploading, setUploading] = useState(false);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const idAdmin = getCookie("idUser") || "2";
    const [sendMessageMutation] = useSendMessageMutation();
    const { data: conversationsData } = useGetAllConversationsQuery();
    const { data: userList } = useGetPatientListQuery();
    const { data: conversationData } = useGetConversationQuery(
        selectedPatient ? { userId1: idAdmin, userId2: selectedPatient } : skipToken,
        { skip: !selectedPatient }
    );

    // load lại messages khi đổi bệnh nhân
    useEffect(() => {
        if (!conversationData) return;
        const mapped: ChatMessage[] = conversationData.map((m: any) => ({
            id: m.id,
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            message: m.message,
            message_type: m.message_type,
            created_at: m.created_at,
            fromRole: String(m.sender_id) === idAdmin ? "admin" : "patient",
        }));
        setMessages(mapped);
        setTimeout(() => scrollToBottom(), 50);
    }, [conversationData]);

    useEffect(() => {
        const role = getCookie("role") || "admin";

        const onConnect = () => {
            socket.emit("join_room", { role, idUser: idAdmin });
        };

        const onReceivePrivate = (data: any) => {
            const normalized: ChatMessage = {
                id: data.id,
                sender_id: data.fromUserId,
                receiver_id: data.toUserId,
                message: data.message || data.text,
                message_type: data.message_type || "text",
                created_at: data.createdAt || new Date().toISOString(),
                fromRole: data.fromRole,
            };
            setMessages((prev) => [...prev, normalized]);
            setTimeout(() => scrollToBottom(), 10);
        };

        socket.on("connect", onConnect);
        socket.on("receive_private_message", onReceivePrivate);

        if (socket.connected) onConnect();

        return () => {
            socket.off("connect", onConnect);
            socket.off("receive_private_message", onReceivePrivate);
        };
    }, []);

    const scrollToBottom = () => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    };

    // Gửi text
    const sendMessage = async () => {
        if (!inputValue.trim() || !selectedPatient) return;
        try {
            const formData = new FormData();
            formData.append("sender_id", idAdmin);
            formData.append("receiver_id", selectedPatient);
            formData.append("message", inputValue.trim());
            formData.append("message_type", "text");

            const res: any = await sendMessageMutation(formData).unwrap();
            const saved = res?.data || res;

            const payload = {
                fromUserId: saved.sender_id,
                toUserId: saved.receiver_id,
                text: saved.message,
                message: saved.message,
                fromRole: "admin",
                message_type: "text",

                id: saved.id,
                createdAt: saved.created_at,
            };

            socket.emit("send_private_message", payload);
            setInputValue("");
        } catch (err) {
            antdMessage.error("Gửi thất bại");
        }
    };

    // Gửi ảnh/file
    const handleUpload = async (file: File) => {
        if (!selectedPatient) {
            antdMessage.warning("Chọn bệnh nhân trước khi gửi file");
            return false;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("sender_id", idAdmin);
            formData.append("receiver_id", selectedPatient);
            formData.append("message", file.name);
            formData.append("file", file);

            // phân loại image/file
            if (file.type.startsWith("image/")) {
                formData.append("message_type", "image");
            } else {
                formData.append("message_type", "file");
            }

            const res: any = await sendMessageMutation(formData).unwrap();
            const saved = res?.data || res;

            const payload = {
                fromUserId: saved.sender_id,
                toUserId: saved.receiver_id,
                text: saved.message,
                fromRole: "admin",
                message_type: saved.message_type,
                url: saved.url,
                id: saved.id,
                createdAt: saved.created_at,
            };

            socket.emit("send_private_message", payload);
        } catch (err) {
            antdMessage.error("Upload thất bại");
        } finally {
            setUploading(false);
        }
        return false;
    };
    const [unreadMap, setUnreadMap] = useState<{ [key: string]: number }>({});
    const onReceivePrivate = (data: any) => {
        const fromUser = String(data.fromUserId);

        if (fromUser !== selectedPatient) {
            setUnreadMap((prev) => ({
                ...prev,
                [fromUser]: (prev[fromUser] || 0) + 1,
            }));
        }

        const normalized: ChatMessage = {
            id: data.id,
            sender_id: data.fromUserId,
            receiver_id: data.toUserId,
            message: data.message || data.text,
            message_type: data.message_type || "text",
            created_at: data.createdAt || new Date().toISOString(),
            fromRole: data.fromRole,
        };
        setMessages((prev) => [...prev, normalized]);
        setTimeout(() => scrollToBottom(), 10);
    };
    const handleSelectPatient = (userId: string) => {
        setSelectedPatient(userId);
        setUnreadMap((prev) => ({ ...prev, [userId]: 0 }));
    };
    return (
        <div style={{ display: "flex", height: "100vh", background: "#f5f5f5" }}>
            <div style={{ width: 250, background: "#fff", borderRight: "1px solid #ddd", padding: 16 }}>
                <Title level={4}>Danh sách cuộc trò chuyện</Title>
                <List
                    dataSource={conversationsData || []}
                    renderItem={(conv: any) => {
                        const userId =
                            String(conv.sender_id) === idAdmin ? conv.receiver_id : conv.sender_id;

                        const user = userList.find((u: any) => String(u.user_id) === String(userId));
                        const displayName = user ? user.full_name : `User ${userId}`;

                        let lastMsg = conv.message || "Chưa có tin nhắn";
                        if (conv.message_type === "image") lastMsg = "Đã gửi 1 ảnh";
                        if (conv.message_type === "file") lastMsg = "Đã gửi 1 tệp";

                        return (
                            <List.Item
                                onClick={() => handleSelectPatient(userId)}
                                style={{
                                    cursor: "pointer",
                                    background: selectedPatient === userId ? "#11A998" : "transparent",
                                    color: selectedPatient === userId ? "#fff" : "#000",
                                    borderRadius: 6,
                                    marginBottom: 4,
                                    padding: 8,
                                }}
                            >
                                <Badge dot={!!unreadMap[userId]}>
                                    <div>
                                        <strong>{displayName}</strong>
                                        <div style={{ fontSize: 12, opacity: 0.7 }}>{lastMsg}</div>
                                    </div>
                                </Badge>
                            </List.Item>
                        );
                    }}
                />
            </div>

            {/* Chat box */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {selectedPatient ? (
                    <>
                        <Card style={{ flex: 1, margin: 16, overflowY: "auto" }}>
                            <div ref={scrollRef} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {messages.length === 0 ? (
                                    <div className="text-gray-500">Chưa có tin nhắn</div>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                textAlign: msg.fromRole === "admin" ? "right" : "left",
                                                marginBottom: 8,
                                            }}
                                        >
                                            <span
                                                style={{
                                                    display: "inline-block",
                                                    padding: "8px 12px",
                                                    borderRadius: 12,
                                                    backgroundColor: msg.fromRole === "admin" ? "#11A998" : "#e4e6eb",
                                                    color: msg.fromRole === "admin" ? "white" : "black",
                                                    maxWidth: 260,
                                                    wordBreak: "break-word",
                                                }}
                                            >
                                                {msg.message_type === "text" && msg.message}
                                                {msg.message_type === "image" && msg.message && (
                                                    <Image
                                                        src={msg.message}
                                                        alt="img"

                                                        style={{ maxWidth: "150px", borderRadius: 8 }}
                                                    />
                                                )}
                                                {msg.message_type === "file" && (
                                                    <a
                                                        href={msg.message}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: "#fff", textDecoration: "underline" }}
                                                    >
                                                        📎 {msg.message}
                                                    </a>
                                                )}
                                                <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>
                                                    {new Date(msg.created_at).toLocaleDateString("vi-VN")}{" "}
                                                    {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </div>
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        <div style={{ display: "flex", padding: 16, gap: 8 }}>
                            <Upload beforeUpload={handleUpload} showUploadList={false} disabled={uploading}>
                                <Button icon={<PaperClipOutlined />} />
                            </Upload>
                            <Input
                                placeholder={`Nhắn tin cho ${selectedPatient}`}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPressEnter={sendMessage}
                            />
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={sendMessage}
                                style={{ background: "#11A998", border: "none" }}
                                disabled={uploading}
                            />
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
                        <p>Chọn một bệnh nhân để bắt đầu chat</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminChat;
