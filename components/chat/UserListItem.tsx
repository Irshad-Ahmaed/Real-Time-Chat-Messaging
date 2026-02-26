"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
    _id: string;
    name: string;
    email: string;
    imageUrl: string;
    isOnline: boolean;
}

export default function UserListItem({
    user,
    onClick,
}: {
    user: User;
    onClick: () => void;
}) {
    // Get initials from name
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-md mx-2 transition-colors text-left"
        >
            <div className="relative">
                <Avatar className="size-10">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                {user.isOnline && (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-emerald-500 border-2 border-background" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                </p>
            </div>
        </button>
    );
}
