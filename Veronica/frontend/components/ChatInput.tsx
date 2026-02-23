"use client";

import React, { useState } from 'react';
import { Send, Mic, Image as ImageIcon } from 'lucide-react';
import styles from './ChatInput.module.css';

interface ChatInputProps {
    onSendMessage: (text: string) => void;
    isStreaming: boolean;
}

export const ChatInput = ({ onSendMessage, isStreaming }: ChatInputProps) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isStreaming) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <form className={`${styles.container} glass animate-fade-in`} onSubmit={handleSubmit}>
            <button type="button" className={styles.iconBtn} title="Voice Command">
                <Mic size={20} />
            </button>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="How can I help you today, Sir?"
                className={styles.input}
                disabled={isStreaming}
            />
            <button type="button" className={styles.iconBtn} title="Analyze Image">
                <ImageIcon size={20} />
            </button>
            <button type="submit" className={styles.sendBtn} disabled={!input.trim() || isStreaming}>
                <Send size={20} />
            </button>
        </form>
    );
};
