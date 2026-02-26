"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimestamp } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MessageReactions from "./MessageReactions";

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
        reactions?: {
            emoji: string;
            count: number;
            hasReacted: boolean;
        }[];
    };
    showAvatar?: boolean;
}

export default function MessageBubble({
    message,
    showAvatar = true,
}: MessageBubbleProps) {
    const deleteMessage = useMutation(api.messages.deleteMessage);

    const handleDelete = async () => {
        try {
            await deleteMessage({ messageId: message._id as Id<"messages"> });
        } catch (error) {
            console.error("Failed to delete message:", error);
        }
    };

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

                <div className={cn("flex items-center gap-2", message.isOwn ? "flex-row-reverse" : "flex-row")}>
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

                    {/* Actions Menu */}
                    {message.isOwn && !message.isDeleted && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:bg-muted rounded-full flex-shrink-0">
                                    <MoreHorizontal className="size-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                                >
                                    <Trash2 className="size-4 mr-2" />
                                    Delete message
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Reactions */}
                {message.reactions && (
                    <MessageReactions
                        messageId={message._id as Id<"messages">}
                        reactions={message.reactions}
                        isOwn={message.isOwn}
                        isDeleted={message.isDeleted}
                    />
                )}

                {/* Timestamp */}
                <span className="text-[10px] text-muted-foreground mt-0.5 mx-1 opacity-50 group-hover:opacity-100 transition-opacity">
                    {formatTimestamp(message.timestamp)}
                </span>
            </div>
        </div>
    );
}
