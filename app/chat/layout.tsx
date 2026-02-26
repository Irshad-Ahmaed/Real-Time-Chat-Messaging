"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";
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
                    {/* Sidebar — hidden on mobile, shown on md+ */}
                    <aside className="hidden md:flex w-80 flex-shrink-0">
                        <Sidebar />
                    </aside>

                    {/* Main chat area */}
                    <main className="flex-1 flex flex-col min-w-0">
                        {children}
                    </main>
                </div>
            </Authenticated>
        </>
    );
}
