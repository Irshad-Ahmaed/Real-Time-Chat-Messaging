"use client";

import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Redirects authenticated users to /chat
function AuthenticatedRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.push("/chat");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      {/* Loading state while Convex validates the auth token */}
      <AuthLoading>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </AuthLoading>

      {/* Authenticated: redirect to chat */}
      <Authenticated>
        <AuthenticatedRedirect />
      </Authenticated>

      {/* Not authenticated: show landing/sign-in */}
      <Unauthenticated>
        <div className="flex flex-col items-center gap-8 px-4 text-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary p-3">
              <MessageCircle className="size-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Tars Chat
            </h1>
          </div>

          <p className="max-w-md text-lg text-muted-foreground">
            Real-time messaging. Connect with anyone, instantly.
          </p>

          <div className="flex gap-4">
            <SignInButton mode="modal">
              <Button size="lg" className="text-base">
                Get Started
              </Button>
            </SignInButton>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
