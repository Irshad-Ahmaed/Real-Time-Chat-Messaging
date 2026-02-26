import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // User profiles synced from Clerk
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
        isOnline: v.boolean(),
        lastSeen: v.number(),
    })
        .index("by_clerkId", ["clerkId"])
        .index("by_name", ["name"]),

    // Conversations (1:1 and group chats)
    conversations: defineTable({
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        groupImage: v.optional(v.string()),
        participants: v.array(v.id("users")),
        lastMessageTime: v.optional(v.number()),
    }).index("by_lastMessageTime", ["lastMessageTime"]),

    // Chat messages
    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        content: v.string(),
        type: v.union(v.literal("text"), v.literal("system")),
        isDeleted: v.boolean(),
        timestamp: v.number(),
    }).index("by_conversation", ["conversationId", "timestamp"]),

    // Emoji reactions on messages
    reactions: defineTable({
        messageId: v.id("messages"),
        userId: v.id("users"),
        emoji: v.string(),
    }).index("by_message", ["messageId"]),

    // Tracks who is currently typing in each conversation
    typingStatus: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastTyped: v.number(),
    }).index("by_conversation", ["conversationId"]),

    // Tracks last read timestamp per user per conversation
    readReceipts: defineTable({
        conversationId: v.id("conversations"),
        userId: v.id("users"),
        lastReadTime: v.number(),
    }).index("by_conversation_user", ["conversationId", "userId"]),
});
