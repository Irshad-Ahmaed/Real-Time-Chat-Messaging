"use client";

export default function ConversationError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center px-4">
            <h2 className="text-lg font-semibold">
                Something went wrong
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm">
                {error.message || "Failed to load conversation."}
            </p>
            <button
                onClick={reset}
                className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
            >
                Try again
            </button>
        </div>
    );
}
