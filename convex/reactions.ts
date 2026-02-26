import { v } from "convex/values";
import { mutation } from "./_generated/server";

const ALLOWED_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();
        if (!currentUser) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message || message.isDeleted) {
            throw new Error("Message not available");
        }

        if (!ALLOWED_EMOJIS.includes(args.emoji)) {
            throw new Error("Invalid emoji");
        }

        // Check if reaction exists
        const existing = await ctx.db
            .query("reactions")
            .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
            .filter((q) => q.eq(q.field("userId"), currentUser._id))
            .filter((q) => q.eq(q.field("emoji"), args.emoji))
            .unique();

        if (existing) {
            // Toggle off: remove it
            await ctx.db.delete(existing._id);
        } else {
            // Toggle on: add it
            await ctx.db.insert("reactions", {
                messageId: args.messageId,
                userId: currentUser._id,
                emoji: args.emoji,
            });
        }
    },
});
