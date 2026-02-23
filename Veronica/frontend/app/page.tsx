"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatWindow } from "@/components/ChatWindow";
import { ChatInput } from "@/components/ChatInput";

export default function Home() {
    const { messages, sendMessage, isStreaming } = useWebSocket("ws://localhost:8001/ws/chat");

    return (
        <main>
            <ChatWindow messages={messages} />
            <ChatInput onSendMessage={sendMessage} isStreaming={isStreaming} />
        </main>
    );
}
