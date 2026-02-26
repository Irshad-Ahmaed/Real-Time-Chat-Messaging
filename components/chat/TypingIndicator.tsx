"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface TypingIndicatorProps {
    conversationId: Id<"conversations">;
}

export default function TypingIndicator({
    conversationId,
}: TypingIndicatorProps) {
    const typingUsers = useQuery(api.typing.getTypingUsers, {
        conversationId,
    });

    if (!typingUsers || typingUsers.length === 0) return null;

    const text =
        typingUsers.length === 1
            ? `${typingUsers[0].name} is typing`
            : typingUsers.length === 2
                ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing`
                : "Several people are typing";

    return (
        <div className="px-4 py-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {/* Animated dots */}
                <span className="flex gap-0.5">
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                    <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                </span>
                <span className="italic">{text}</span>
            </div>
        </div>
    );
}
