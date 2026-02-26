"use client";

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatArea from "@/components/chat/ChatArea";

export default function ConversationPage({
    params,
}: {
    params: Promise<{ conversationId: string }>;
}) {
    const { conversationId } = use(params);
    const router = useRouter();
    const conversation = useQuery(api.conversations.getConversation, {
        conversationId: conversationId as Id<"conversations">,
    });

    // Loading state
    if (conversation === undefined) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Conversation not found or no access
    if (conversation === null) {
        router.push("/chat");
        return null;
    }

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

    return (
        <div className="flex flex-col h-full">
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-background">
                {/* Back button — visible on mobile only */}
                <button
                    onClick={() => router.push("/chat")}
                    className="md:hidden p-1.5 -ml-1.5 rounded-md hover:bg-accent transition-colors"
                >
                    <ArrowLeft className="size-5" />
                </button>

                <Avatar className="size-9">
                    <AvatarImage
                        src={otherUser?.imageUrl}
                        alt={displayName}
                    />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold truncate">
                        {displayName}
                    </h2>
                    {otherUser?.isOnline && (
                        <p className="text-[11px] text-emerald-500">Online</p>
                    )}
                </div>
            </div>

            {/* Chat area: messages + input */}
            <ChatArea
                conversationId={conversationId as Id<"conversations">}
            />
        </div>
    );
}
