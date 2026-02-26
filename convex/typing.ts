import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const TYPING_TIMEOUT_MS = 3000; // 3 seconds TTL

// Set typing status for the current user in a conversation
export const setTyping = mutation({
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

        // Check if typing record already exists
        const existing = await ctx.db
            .query("typingStatus")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) => q.eq(q.field("userId"), currentUser._id))
            .unique();

        if (existing) {
            await ctx.db.patch(existing._id, { lastTyped: Date.now() });
        } else {
            await ctx.db.insert("typingStatus", {
                conversationId: args.conversationId,
                userId: currentUser._id,
                lastTyped: Date.now(),
            });
        }
    },
});

// Clear typing status
export const clearTyping = mutation({
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

        const existing = await ctx.db
            .query("typingStatus")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .filter((q) => q.eq(q.field("userId"), currentUser._id))
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
        }
    },
});

// Get users currently typing in a conversation (excluding self)
export const getTypingUsers = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();
        if (!currentUser) return [];

        const now = Date.now();
        const typingRecords = await ctx.db
            .query("typingStatus")
            .withIndex("by_conversation", (q) =>
                q.eq("conversationId", args.conversationId)
            )
            .collect();

        // Filter: exclude self, exclude stale (older than TTL)
        const activeTypers = typingRecords.filter(
            (record) =>
                record.userId !== currentUser._id &&
                now - record.lastTyped < TYPING_TIMEOUT_MS
        );

        // Get user details
        const users = await Promise.all(
            activeTypers.map((record) => ctx.db.get(record.userId))
        );

        return users.filter(Boolean).map((u) => ({ name: u!.name }));
    },
});
