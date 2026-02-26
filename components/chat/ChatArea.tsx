"use client";

import { useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageSquare } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import EmptyState from "./EmptyState";

interface ChatAreaProps {
    conversationId: Id<"conversations">;
}

export default function ChatArea({ conversationId }: ChatAreaProps) {
    const messages = useQuery(api.messages.getMessages, { conversationId });
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages?.length]);

    return (
        <div className="flex flex-col h-full">
            {/* Messages area */}
            <ScrollArea className="flex-1">
                <div className="flex flex-col py-4 min-h-full">
                    {/* Loading state */}
                    {messages === undefined && (
                        <div className="flex flex-1 items-center justify-center py-20">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* Empty state — no messages */}
                    {messages?.length === 0 && (
                        <EmptyState
                            icon={MessageSquare}
                            title="No messages yet"
                            description="Send the first message to start the conversation"
                        />
                    )}

                    {/* Message list */}
                    {messages?.map((msg, idx) => {
                        // Show avatar for first message or when sender changes
                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                        const showAvatar =
                            !msg.isOwn &&
                            (!prevMsg || prevMsg.sender?._id !== msg.sender?._id);

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
            </ScrollArea>

            {/* Message input */}
            <MessageInput conversationId={conversationId} />
        </div>
    );
}
