"use client";

import React, { useRef, useEffect } from 'react';
import styles from './ChatWindow.module.css';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    id: string;
};

export const ChatWindow = ({ messages }: { messages: Message[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className={`${styles.window} glass`} ref={scrollRef}>
            {messages.map((msg) => (
                <div key={msg.id} className={`${styles.bubble} ${styles[msg.role]} animate-fade-in`}>
                    <div className={styles.avatar}>
                        {msg.role === 'assistant' ? 'V' : 'U'}
                    </div>
                    <div className={styles.content}>{msg.content}</div>
                </div>
            ))}
            {messages.length === 0 && (
                <div className={styles.welcome}>
                    <h1>Veronica</h1>
                    <p>Empathetic intelligence at your service, Sir.</p>
                </div>
            )}
        </div>
    );
};
