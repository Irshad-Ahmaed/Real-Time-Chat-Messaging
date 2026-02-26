"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, MessageCircle } from "lucide-react";

// Redirect unauthenticated users to home page
function UnauthenticatedRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.push("/");
    }, [router]);
    return null;
}

export default function ChatPage() {
    return (
        <>
            <AuthLoading>
                <div className="flex min-h-screen items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            </AuthLoading>

            {/* Redirect if not logged in */}
            <Unauthenticated>
                <UnauthenticatedRedirect />
            </Unauthenticated>

            <Authenticated>
                <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
                    <MessageCircle className="size-16 text-muted-foreground/30" />
                    <h2 className="text-xl font-medium">Welcome to Tars Chat</h2>
                    <p className="text-sm">
                        Select a conversation or search for a user to start
                        chatting
                    </p>
                </div>
            </Authenticated>
        </>
    );
}
