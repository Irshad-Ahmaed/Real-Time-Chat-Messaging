"use client";

import { useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";

const HEARTBEAT_INTERVAL = 30000; // 30 seconds

// Tracks user online/offline status reliably via heartbeat
export function useOnlineStatus() {
    const { isAuthenticated } = useConvexAuth();
    const updatePresence = useMutation(api.users.updatePresence);
    const setOnlineStatus = useMutation(api.users.setOnlineStatus);

    const markOnline = useCallback(() => {
        if (!isAuthenticated) return;
        updatePresence().catch(() => { });
    }, [isAuthenticated, updatePresence]);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Initial online ping
        markOnline();

        // Start heartbeat ping every 30s
        const intervalId = setInterval(markOnline, HEARTBEAT_INTERVAL);

        // Handle visibility changes (update immediately when returning to tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                markOnline();
            } else {
                // If they hide the tab, mark them offline immediately for faster UI updates
                setOnlineStatus({ isOnline: false }).catch(() => { });
            }
        };

        // Handle page close / navigation away
        const handleBeforeUnload = () => {
            setOnlineStatus({ isOnline: false }).catch(() => { });
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            clearInterval(intervalId);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            setOnlineStatus({ isOnline: false }).catch(() => { });
        };
    }, [isAuthenticated, markOnline, setOnlineStatus]);
}
