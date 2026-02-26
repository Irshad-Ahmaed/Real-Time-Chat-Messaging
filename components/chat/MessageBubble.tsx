"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimestamp } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    message: {
        _id: string;
        content: string;
        isDeleted: boolean;
        timestamp: number;
        isOwn: boolean;
        sender?: {
            name: string;
            imageUrl: string;
        } | null;
    };
    showAvatar?: boolean;
}

export default function MessageBubble({
    message,
    showAvatar = true,
}: MessageBubbleProps) {
    const initials = message.sender?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "?";

    return (
        <div
            className={cn(
                "flex gap-2 px-4 py-0.5 group",
                message.isOwn ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar (only for other's messages) */}
            {!message.isOwn && showAvatar ? (
                <Avatar className="size-8 flex-shrink-0 mt-1">
                    <AvatarImage
                        src={message.sender?.imageUrl}
                        alt={message.sender?.name || "User"}
                    />
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            ) : !message.isOwn ? (
                <div className="size-8 flex-shrink-0" />
            ) : null}

            {/* Message content */}
            <div
                className={cn(
                    "flex flex-col max-w-[70%]",
                    message.isOwn ? "items-end" : "items-start"
                )}
            >
                {/* Sender name (only for other's messages, when avatar shown) */}
                {!message.isOwn && showAvatar && (
                    <span className="text-[11px] text-muted-foreground ml-1 mb-0.5">
                        {message.sender?.name}
                    </span>
                )}

                <div
                    className={cn(
                        "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                        message.isDeleted
                            ? "bg-muted text-muted-foreground italic"
                            : message.isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                    )}
                >
                    {message.isDeleted
                        ? "This message was deleted"
                        : message.content}
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground mt-0.5 mx-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTimestamp(message.timestamp)}
                </span>
            </div>
        </div>
    );
}
