"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function UnreadBadge({
    conversationId,
}: {
    conversationId: Id<"conversations">;
}) {
    const unreadCount = useQuery(api.readReceipts.getUnreadCount, {
        conversationId,
    });

    if (!unreadCount || unreadCount === 0) return null;

    return (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[11px] font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
        </span>
    );
}
