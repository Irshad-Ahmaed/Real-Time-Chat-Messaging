"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "@/components/chat/Sidebar";

// Redirect unauthenticated users to home
function UnauthenticatedRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.push("/");
    }, [router]);
    return null;
}

export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAtRoot = pathname === "/chat";

    return (
        <>
            <AuthLoading>
                <div className="flex h-screen items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            </AuthLoading>

            <Unauthenticated>
                <UnauthenticatedRedirect />
            </Unauthenticated>

            <Authenticated>
                <div className="flex h-screen overflow-hidden bg-background">
                    {/* Sidebar — hidden on mobile when in a conversation, shown on md+ or when at /chat */}
                    <aside
                        className={`flex-shrink-0 w-full md:w-[320px] border-r border-border/40 bg-card/50 shadow-sm z-10 
                        ${isAtRoot ? "flex" : "hidden md:flex"}`}
                    >
                        <Sidebar />
                    </aside>

                    {/* Main chat area — hidden on mobile when at /chat, shown on md+ or when in a conversation */}
                    <main
                        className={`flex-1 flex flex-col min-w-0 
                        ${isAtRoot ? "hidden md:flex" : "flex"}`}
                    >
                        {children}
                    </main>
                </div>
            </Authenticated>
        </>
    );
}
