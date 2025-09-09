// AdminChat.tsx
"use client";
import React, { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";

interface Message {
    sender: "admin" | "patient";
    text: string;
}

const socket: Socket = io("http://localhost:5000", {
    withCredentials: true,
});

const Test: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        // Khi admin kết nối
        socket.emit("join", { role: "admin" });

        // Nhận tin nhắn từ server
        socket.on("receiveMessage", (data: Message) => {
            setMessages((prev) => [...prev, data]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const handleSend = () => {
        if (input.trim() === "") return;
        const newMessage: Message = { sender: "admin", text: input };
        socket.emit("sendMessage", newMessage);
        setMessages((prev) => [...prev, newMessage]);
        setInput("");
    };

    return (
        <div className="flex flex-col h-screen w-96 border rounded-lg shadow-lg bg-white">
            <div className="bg-green-600 text-white p-3 text-lg font-semibold rounded-t-lg">
                Admin Chat
            </div>

            {/* Khung tin nhắn */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`p-2 rounded-lg max-w-[75%] ${msg.sender === "admin"
                            ? "bg-green-500 text-white self-end ml-auto"
                            : "bg-gray-200 text-black self-start mr-auto"
                            }`}
                    >
                        <span className="text-sm">{msg.text}</span>
                    </div>
                ))}
            </div>

            {/* Ô nhập */}
            <div className="flex p-3 border-t">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 border rounded-lg px-3 py-2 focus:outline-none"
                />
                <button
                    onClick={handleSend}
                    className="ml-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
};

export default Test;
