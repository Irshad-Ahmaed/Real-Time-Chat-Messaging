"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

interface ReactionData {
    emoji: string;
    count: number;
    hasReacted: boolean;
}

interface MessageReactionsProps {
    messageId: Id<"messages">;
    reactions: ReactionData[];
    isOwn: boolean;
    isDeleted: boolean;
}

export default function MessageReactions({
    messageId,
    reactions,
    isOwn,
    isDeleted,
}: MessageReactionsProps) {
    const toggleReaction = useMutation(api.reactions.toggleReaction);

    if (isDeleted) return null;

    const handleReact = (emoji: string) => {
        toggleReaction({ messageId, emoji }).catch(() => { });
    };

    return (
        <div className={cn("flex items-center gap-1 mt-1", isOwn ? "justify-end" : "justify-start")}>
            {reactions.length > 0 &&
                reactions.map((reaction) => (
                    <button
                        key={reaction.emoji}
                        onClick={() => handleReact(reaction.emoji)}
                        className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 text-xs rounded-full border transition-colors",
                            reaction.hasReacted
                                ? "border-primary text-primary bg-primary/5 hover:bg-primary/10"
                                : "border-border text-muted-foreground bg-background hover:bg-muted"
                        )}
                    >
                        <span>{reaction.emoji}</span>
                        <span className="font-medium text-[10px]">{reaction.count}</span>
                    </button>
                ))}

            <Popover>
                <PopoverTrigger asChild>
                    <button className="p-1 rounded-full text-muted-foreground hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                        <Smile className="size-4" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    side="top"
                    align={isOwn ? "end" : "start"}
                    className="w-auto p-1.5 flex gap-1 shadow-lg rounded-full"
                >
                    {ALLOWED_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => handleReact(emoji)}
                            className="p-2 hover:bg-muted rounded-full text-lg transition-transform hover:scale-110"
                        >
                            {emoji}
                        </button>
                    ))}
                </PopoverContent>
            </Popover>
        </div>
    );
}
