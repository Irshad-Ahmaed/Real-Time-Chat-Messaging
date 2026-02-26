"use client";

import { useCallback, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Debounced typing indicator hook
// Calls setTyping on first keystroke, then debounces.
// Auto-clears after 2 seconds of no input.
export function useTypingIndicator(conversationId: Id<"conversations">) {
    const setTyping = useMutation(api.typing.setTyping);
    const clearTyping = useMutation(api.typing.clearTyping);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastSentRef = useRef<number>(0);

    const onType = useCallback(() => {
        const now = Date.now();

        // Throttle: only send setTyping once per second
        if (now - lastSentRef.current > 1000) {
            setTyping({ conversationId }).catch(() => { });
            lastSentRef.current = now;
        }

        // Reset the auto-clear timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Clear typing after 2 seconds of inactivity
        timeoutRef.current = setTimeout(() => {
            clearTyping({ conversationId }).catch(() => { });
        }, 2000);
    }, [conversationId, setTyping, clearTyping]);

    // Call when message is sent to immediately clear
    const onSend = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        clearTyping({ conversationId }).catch(() => { });
        lastSentRef.current = 0;
    }, [conversationId, clearTyping]);

    return { onType, onSend };
}
