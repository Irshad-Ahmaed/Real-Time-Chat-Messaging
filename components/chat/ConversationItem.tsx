"use client";

import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Id } from "@/convex/_generated/dataModel";
import { formatRelativeTime } from "@/lib/utils";
import UnreadBadge from "./UnreadBadge";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ConversationItem({ conversation }: { conversation: any }) {
    const router = useRouter();
    const pathname = usePathname();
    const isActive = pathname === `/chat/${conversation._id}`;

    const otherUser = conversation.otherParticipants?.[0];
    const displayName = conversation.isGroup
        ? conversation.groupName || "Group Chat"
        : otherUser?.name || "Unknown User";

    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const avatarUrl = conversation.isGroup ? undefined : otherUser?.imageUrl;
    const isOnline = !conversation.isGroup && otherUser?.isOnline;

    // Last message preview
    let lastMessagePreview = "No messages yet";
    if (conversation.lastMessage) {
        if (conversation.lastMessage.isDeleted) {
            lastMessagePreview = "This message was deleted";
        } else {
            lastMessagePreview = conversation.lastMessage.content;
        }
    }

    return (
        <button
            onClick={() => router.push(`/chat/${conversation._id}`)}
            className={`group flex items-center gap-3 px-3 py-3 rounded-2xl mx-2 mb-1 transition-all duration-300 text-left w-[calc(100%-16px)] ${isActive
                ? "bg-background shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-border/60"
                : "border border-transparent hover:bg-muted/60"
                }`}
        >
            <div className="relative flex-shrink-0">
                <Avatar className="size-11">
                    <AvatarImage src={avatarUrl} alt={displayName} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                {isOnline && (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-background" />
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className={`text-[15px] tracking-tight truncate ${isActive ? "font-semibold text-foreground" : "font-medium text-foreground/90 group-hover:text-foreground"}`}>
                        {displayName}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {conversation.lastMessage && (
                            <span className="text-[11px] text-muted-foreground">
                                {formatRelativeTime(
                                    conversation.lastMessage.timestamp
                                )}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-muted-foreground truncate flex-1">
                        {lastMessagePreview}
                    </p>
                    {/* Unread badge */}
                    <div className="flex-shrink-0 ml-2">
                        <UnreadBadge
                            conversationId={conversation._id as Id<"conversations">}
                        />
                    </div>
                </div>
            </div>
        </button>
    );
}
