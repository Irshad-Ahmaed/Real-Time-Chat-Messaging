"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Smart auto-scroll hook:
// - Scrolls to bottom when new messages arrive (if already at bottom)
// - Shows "new messages" indicator if user scrolled up
export function useSmartScroll(messageCount: number) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const [showNewMessages, setShowNewMessages] = useState(false);
    const isAtBottomRef = useRef(true);
    const prevCountRef = useRef(messageCount);

    // Check if user is near the bottom (within 100px)
    const checkIfAtBottom = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return true;
        const threshold = 100;
        return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }, []);

    // Handle scroll event
    const handleScroll = useCallback(() => {
        const atBottom = checkIfAtBottom();
        isAtBottomRef.current = atBottom;
        if (atBottom) {
            setShowNewMessages(false);
        }
    }, [checkIfAtBottom]);

    // React to new messages
    useEffect(() => {
        if (messageCount > prevCountRef.current) {
            if (isAtBottomRef.current) {
                // Auto-scroll to bottom
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            } else {
                // User is scrolled up — show indicator
                setShowNewMessages(true);
            }
        }
        prevCountRef.current = messageCount;
    }, [messageCount]);

    // Scroll to bottom on initial load
    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, []);

    // Scroll to bottom (called by "New messages" button)
    const scrollToBottom = useCallback(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowNewMessages(false);
    }, []);

    return {
        scrollRef,
        bottomRef,
        showNewMessages,
        handleScroll,
        scrollToBottom,
    };
}
