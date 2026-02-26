"use client";

import { useState, useRef, FormEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
    conversationId: Id<"conversations">;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
    const [content, setContent] = useState("");
    const [isSending, setIsSending] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const sendMessage = useMutation(api.messages.sendMessage);

    const handleSend = async (e?: FormEvent) => {
        e?.preventDefault();
        const trimmed = content.trim();
        if (!trimmed || isSending) return;

        setIsSending(true);
        try {
            await sendMessage({
                conversationId,
                content: trimmed,
            });
            setContent("");
            // Re-focus the input after sending
            inputRef.current?.focus();
        } catch (err) {
            console.error("Failed to send message:", err);
        } finally {
            setIsSending(false);
        }
    };

    // Handle Enter to send, Shift+Enter for new line
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        const textarea = e.target;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    };

    return (
        <form
            onSubmit={handleSend}
            className="flex items-end gap-2 px-4 py-3 border-t bg-background"
        >
            <textarea
                ref={inputRef}
                value={content}
                onChange={handleInput}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                maxLength={5000}
                className="flex-1 resize-none rounded-xl border bg-muted/50 px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 min-h-[40px] max-h-[120px]"
            />
            <Button
                type="submit"
                size="icon"
                disabled={!content.trim() || isSending}
                className="rounded-xl size-10 flex-shrink-0"
            >
                <Send className="size-4" />
            </Button>
        </form>
    );
}
