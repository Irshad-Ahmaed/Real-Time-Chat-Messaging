"use client";

import { ReactNode, useEffect } from "react";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Validate env var exists
if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env.local file");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// Syncs Clerk user profile to Convex DB once Convex auth is ready
function UserSync() {
    const { user, isLoaded } = useUser();
    const { isAuthenticated } = useConvexAuth();
    const createOrUpdateUser = useMutation(api.users.createOrUpdateUser);

    // Track online/offline status
    useOnlineStatus();

    useEffect(() => {
        // Wait for BOTH Clerk user AND Convex auth to be ready
        if (!isLoaded || !user || !isAuthenticated) return;

        createOrUpdateUser({
            clerkId: user.id,
            name: user.fullName || user.username || "Anonymous",
            email: user.primaryEmailAddress?.emailAddress || "",
            imageUrl: user.imageUrl || "",
        }).catch((err) => {
            console.error("Failed to sync user to Convex:", err);
        });
    }, [user, isLoaded, isAuthenticated, createOrUpdateUser]);

    return null;
}

export default function ConvexClientProvider({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <UserSync />
            {children}
        </ConvexProviderWithClerk>
    );
}
