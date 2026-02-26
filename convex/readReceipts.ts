import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mark a conversation as read by the current user
export const markAsRead = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();
        if (!currentUser) return;

        // Find existing read receipt
        const existing = await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_user", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", currentUser._id)
            )
            .unique();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, { lastReadTime: now });
        } else {
            await ctx.db.insert("readReceipts", {
                conversationId: args.conversationId,
                userId: currentUser._id,
                lastReadTime: now,
            });
        }
    },
});

// Get unread message count for a conversation
export const getUnreadCount = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();
        if (!currentUser) return 0;

        // Get last read time
        const receipt = await ctx.db
            .query("readReceipts")
            .withIndex("by_conversation_user", (q) =>
                q
                    .eq("conversationId", args.conversationId)
                    .eq("userId", currentUser._id)
            )
            .unique();

        const lastReadTime = receipt?.lastReadTime ?? 0;

        // Count messages after lastReadTime, excluding own messages
        const unreadMessages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) =>
                q.and(
                    q.gt(q.field("timestamp"), lastReadTime),
                    q.neq(q.field("senderId"), currentUser._id)
                )
            )
            .collect();

        return unreadMessages.length;
    },
});
