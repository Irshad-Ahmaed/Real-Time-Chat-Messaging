"use client";

import { useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, MessageSquare, ChevronDown } from "lucide-react";
import { useSmartScroll } from "@/hooks/useSmartScroll";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import TypingIndicator from "./TypingIndicator";
import EmptyState from "./EmptyState";

interface ChatAreaProps {
    conversationId: Id<"conversations">;
}

export default function ChatArea({ conversationId }: ChatAreaProps) {
    const messages = useQuery(api.messages.getMessages, { conversationId });
    const markAsRead = useMutation(api.readReceipts.markAsRead);
    const {
        scrollRef,
        bottomRef,
        showNewMessages,
        handleScroll,
        scrollToBottom,
    } = useSmartScroll(messages?.length ?? 0);

    // Mark conversation as read when viewing it
    useEffect(() => {
        markAsRead({ conversationId }).catch(() => { });
    }, [conversationId, markAsRead, messages?.length]);

    return (
        <div className="flex flex-col h-full relative">
            {/* Messages area */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto"
            >
                <div className="flex flex-col py-4 min-h-full">
                    {/* Loading state */}
                    {messages === undefined && (
                        <div className="flex flex-1 items-center justify-center py-20">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* Empty state */}
                    {messages?.length === 0 && (
                        <EmptyState
                            icon={MessageSquare}
                            title="No messages yet"
                            description="Send the first message to start the conversation"
                        />
                    )}

                    {/* Message list */}
                    {messages?.map((msg, idx) => {
                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                        const showAvatar =
                            !msg.isOwn &&
                            (!prevMsg ||
                                prevMsg.sender?._id !== msg.sender?._id);

                        return (
                            <MessageBubble
                                key={msg._id}
                                message={msg}
                                showAvatar={showAvatar}
                            />
                        );
                    })}

                    {/* Scroll anchor */}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Typing indicator */}
            <TypingIndicator conversationId={conversationId} />

            {/* New messages button (shown when scrolled up) */}
            {showNewMessages && (
                <button
                    onClick={scrollToBottom}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium shadow-lg hover:bg-primary/90 transition-colors animate-in fade-in slide-in-from-bottom-2"
                >
                    <ChevronDown className="size-3.5" />
                    New messages
                </button>
            )}

            {/* Message input */}
            <MessageInput conversationId={conversationId} />
        </div>
    );
}
