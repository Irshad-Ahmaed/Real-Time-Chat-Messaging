"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

// Tracks user online/offline status via visibility + beforeunload
export function useOnlineStatus() {
    const { isAuthenticated } = useConvexAuth();
    const setOnlineStatus = useMutation(api.users.setOnlineStatus);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Set online when component mounts
        setOnlineStatus({ isOnline: true }).catch(() => { });

        // Handle visibility changes (tab switch, minimize)
        const handleVisibilityChange = () => {
            setOnlineStatus({
                isOnline: document.visibilityState === "visible",
            }).catch(() => { });
        };

        // Handle page close / navigation away
        const handleBeforeUnload = () => {
            // Use sendBeacon for reliability on page unload
            setOnlineStatus({ isOnline: false }).catch(() => { });
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
            window.removeEventListener("beforeunload", handleBeforeUnload);
            setOnlineStatus({ isOnline: false }).catch(() => { });
        };
    }, [isAuthenticated, setOnlineStatus]);
}
