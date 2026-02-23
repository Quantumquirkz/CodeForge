"use client";

import { useState, useCallback, useRef, useEffect } from 'react';

export type Message = {
    role: 'user' | 'assistant';
    content: string;
    id: string;
};

export const useWebSocket = (url: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const socketRef = useRef<WebSocket | null>(null);

    const connect = useCallback(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) return;

        socketRef.current = new WebSocket(url);

        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'chunk') {
                setMessages((prev) => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage && lastMessage.role === 'assistant') {
                        return [
                            ...prev.slice(0, -1),
                            { ...lastMessage, content: lastMessage.content + data.text },
                        ];
                    } else {
                        return [
                            ...prev,
                            { role: 'assistant', content: data.text, id: Date.now().toString() },
                        ];
                    }
                });
                setIsStreaming(true);
            } else if (data.type === 'end') {
                setIsStreaming(false);
            }
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket Disconnected. Reconnecting...");
            setTimeout(connect, 3000);
        };
    }, [url]);

    useEffect(() => {
        connect();
        return () => socketRef.current?.close();
    }, [connect]);

    const sendMessage = (text: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const userMessage: Message = { role: 'user', content: text, id: Date.now().toString() };
            setMessages((prev) => [...prev, userMessage]);
            socketRef.current.send(JSON.stringify({ text }));
        }
    };

    return { messages, sendMessage, isStreaming };
};
