import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get or create a 1:1 conversation between two users
export const getOrCreateConversation = mutation({
    args: {
        participantId: v.id("users"),
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

        // Prevent creating a conversation with yourself
        if (currentUser._id === args.participantId) {
            throw new Error("Cannot create a conversation with yourself");
        }

        // Check if a 1:1 conversation already exists between these users
        const allConversations = await ctx.db
            .query("conversations")
            .collect();

        const existingConversation = allConversations.find(
            (conv) =>
                !conv.isGroup &&
                conv.participants.length === 2 &&
                conv.participants.includes(currentUser._id) &&
                conv.participants.includes(args.participantId)
        );

        if (existingConversation) {
            return existingConversation._id;
        }

        // Create new 1:1 conversation
        const conversationId = await ctx.db.insert("conversations", {
            isGroup: false,
            participants: [currentUser._id, args.participantId],
            lastMessageTime: Date.now(),
        });

        return conversationId;
    },
});

// Get all conversations for the current user, sorted by most recent
export const getMyConversations = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();

        if (!currentUser) return [];

        // Get all conversations and filter by participant
        const allConversations = await ctx.db
            .query("conversations")
            .order("desc")
            .collect();

        const myConversations = allConversations.filter((conv) =>
            conv.participants.includes(currentUser._id)
        );

        // Enrich each conversation with participant info and last message
        const enrichedConversations = await Promise.all(
            myConversations.map(async (conv) => {
                // Get the other participant(s)
                const otherParticipantIds = conv.participants.filter(
                    (id) => id !== currentUser._id
                );

                const otherParticipants = await Promise.all(
                    otherParticipantIds.map((id) => ctx.db.get(id))
                );

                // Get the last message
                const lastMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversation", (q) =>
                        q.eq("conversationId", conv._id)
                    )
                    .order("desc")
                    .first();

                return {
                    ...conv,
                    otherParticipants: otherParticipants.filter(Boolean),
                    lastMessage,
                };
            })
        );

        // Sort by lastMessageTime (most recent first)
        return enrichedConversations.sort(
            (a, b) => (b.lastMessageTime ?? 0) - (a.lastMessageTime ?? 0)
        );
    },
});

// Get a single conversation by ID with participant details
export const getConversation = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();

        if (!currentUser) return null;

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return null;

        // Verify user is a participant
        if (!conversation.participants.includes(currentUser._id)) {
            return null;
        }

        // Get other participants
        const otherParticipantIds = conversation.participants.filter(
            (id) => id !== currentUser._id
        );

        const otherParticipants = await Promise.all(
            otherParticipantIds.map((id) => ctx.db.get(id))
        );

        return {
            ...conversation,
            currentUserId: currentUser._id,
            otherParticipants: otherParticipants.filter(Boolean),
        };
    },
});

// Create a new group conversation
export const createGroup = mutation({
    args: {
        participantIds: v.array(v.id("users")),
        groupName: v.string(),
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

        if (args.participantIds.length < 2) {
            throw new Error("Group must have at least 2 other members");
        }

        const trimmedName = args.groupName.trim();
        if (!trimmedName) {
            throw new Error("Group name is required");
        }

        const participants = [...new Set([...args.participantIds, currentUser._id])];

        const conversationId = await ctx.db.insert("conversations", {
            isGroup: true,
            groupName: trimmedName,
            participants,
            lastMessageTime: Date.now(),
        });

        return conversationId;
    },
});
