import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const MAX_MESSAGE_LENGTH = 5000;

// Send a message in a conversation
export const sendMessage = mutation({
    args: {
        conversationId: v.id("conversations"),
        content: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        // Get current user
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();
        if (!currentUser) throw new Error("User not found");

        // Validate content
        const trimmedContent = args.content.trim();
        if (trimmedContent.length === 0) {
            throw new Error("Message cannot be empty");
        }
        if (trimmedContent.length > MAX_MESSAGE_LENGTH) {
            throw new Error(
                `Message too long (max ${MAX_MESSAGE_LENGTH} characters)`
            );
        }

        // Verify user is a participant in this conversation
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) throw new Error("Conversation not found");
        if (!conversation.participants.includes(currentUser._id)) {
            throw new Error("You are not a member of this conversation");
        }

        const now = Date.now();

        // Insert message
        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: currentUser._id,
            content: trimmedContent,
            type: "text",
            isDeleted: false,
            timestamp: now,
        });

        // Update conversation's lastMessageTime
        await ctx.db.patch(args.conversationId, {
            lastMessageTime: now,
        });

        return messageId;
    },
});

// Get messages for a conversation (real-time subscription)
export const getMessages = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        // Get current user
        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();
        if (!currentUser) return [];

        // Verify membership
        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return [];
        if (!conversation.participants.includes(currentUser._id)) return [];

        // Get messages sorted by timestamp ascending
        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .order("asc")
            .collect();

        // Enrich with sender info
        const enrichedMessages = await Promise.all(
            messages.map(async (msg) => {
                const sender = await ctx.db.get(msg.senderId);
                return {
                    ...msg,
                    sender,
                    isOwn: msg.senderId === currentUser._id,
                };
            })
        );

        return enrichedMessages;
    },
});
