"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { UserButton } from "@clerk/nextjs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Users, Search } from "lucide-react";
import ConversationItem from "./ConversationItem";
import UserSearch from "./UserSearch";

export default function Sidebar() {
    const router = useRouter();
    const [showUserSearch, setShowUserSearch] = useState(false);
    const conversations = useQuery(api.conversations.getMyConversations);
    const getOrCreateConversation = useMutation(
        api.conversations.getOrCreateConversation
    );

    // When a user is clicked, create/find conversation and navigate
    const handleSelectUser = async (userId: string) => {
        try {
            const conversationId = await getOrCreateConversation({
                participantId: userId as Id<"users">,
            });
            setShowUserSearch(false);
            router.push(`/chat/${conversationId}`);
        } catch (err) {
            console.error("Failed to create conversation:", err);
        }
    };

    return (
        <div className="flex flex-col h-full border-r bg-background">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="flex items-center gap-2">
                    <MessageCircle className="size-5 text-primary" />
                    <h1 className="text-lg font-semibold">Chats</h1>
                </div>
                <div className="flex items-center gap-2">
                    {/* Toggle user search */}
                    <button
                        onClick={() => setShowUserSearch(!showUserSearch)}
                        className="p-2 rounded-md hover:bg-accent transition-colors"
                        title={showUserSearch ? "Show chats" : "Find users"}
                    >
                        {showUserSearch ? (
                            <MessageCircle className="size-5" />
                        ) : (
                            <Users className="size-5" />
                        )}
                    </button>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "size-8",
                            },
                        }}
                    />
                </div>
            </div>

            {/* Content: either user search or conversation list */}
            <ScrollArea className="flex-1">
                {showUserSearch ? (
                    <div className="py-2">
                        <p className="px-4 pb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Find Users
                        </p>
                        <UserSearch onSelectUser={handleSelectUser} />
                    </div>
                ) : (
                    <div className="py-2">
                        {/* Loading state */}
                        {!conversations && (
                            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                                Loading conversations...
                            </p>
                        )}

                        {/* Empty state */}
                        {conversations?.length === 0 && (
                            <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                                <MessageCircle className="size-10 text-muted-foreground/30" />
                                <div>
                                    <p className="text-sm font-medium">
                                        No conversations yet
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Click the{" "}
                                        <Users className="size-3 inline" />{" "}
                                        icon to find users and start chatting
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Conversation list */}
                        {conversations?.map((conv) => (
                            <ConversationItem
                                key={conv._id}
                                conversation={conv}
                            />
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
