import { v } from "convex/values";
import { mutation, query, internalQuery, internalMutation } from "./_generated/server";

// Create or update a user record from Clerk identity.
// Called by ConvexClientProvider on first auth, idempotent.
export const createOrUpdateUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        // Check auth — only authenticated users can call this
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        // Find existing user by clerkId
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (existingUser) {
            // Update existing user profile
            await ctx.db.patch(existingUser._id, {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl,
                isOnline: true,
                lastSeen: Date.now(),
            });
            return existingUser._id;
        }

        // Create new user
        const userId = await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            isOnline: true,
            lastSeen: Date.now(),
        });

        return userId;
    },
});

// Get current user by their Clerk ID
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();

        return user;
    },
});

// Get all users except the current user, for the user list/search
export const getAllUsers = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const users = await ctx.db.query("users").collect();

        // Exclude the current user
        return users.filter((user) => user.clerkId !== identity.subject);
    },
});

// Update online/offline status
export const setOnlineStatus = mutation({
    args: {
        isOnline: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) =>
                q.eq("clerkId", identity.subject)
            )
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                isOnline: args.isOnline,
                lastSeen: Date.now(),
            });
        }
    },
});

// --- Webhook helper functions (called by HTTP actions, no user auth) ---

// Look up a user by Clerk ID — used by webhook handler (internal only)
export const getUserByClerkId = internalQuery({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();
    },
});

// Update user profile by Clerk ID — used by webhook handler (internal only)
export const updateUserByClerkId = internalMutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                name: args.name,
                email: args.email,
                imageUrl: args.imageUrl,
            });
        }
    },
});

// Insert a new user — used by webhook handler (internal only)
export const insertUser = internalMutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        email: v.string(),
        imageUrl: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            email: args.email,
            imageUrl: args.imageUrl,
            isOnline: false,
            lastSeen: Date.now(),
        });
    },
});
