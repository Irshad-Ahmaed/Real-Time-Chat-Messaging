"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import UserListItem from "./UserListItem";

export default function UserSearch({
    onSelectUser,
}: {
    onSelectUser: (userId: string) => void;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const allUsers = useQuery(api.users.getAllUsers);

    // Filter users by name (client-side for simplicity + real-time)
    const filteredUsers = allUsers?.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-2">
            {/* Search input */}
            <div className="relative px-3 mt-1 mb-2">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-muted/40 border-border/50 hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-primary/30 transition-all rounded-xl h-10 shadow-none"
                />
            </div>

            {/* User list */}
            <div className="flex flex-col">
                {allUsers === undefined && (
                    <div className="flex flex-col gap-3 px-3 py-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-[100px]" />
                                    <Skeleton className="h-3 w-[150px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {filteredUsers?.length === 0 && (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                        {searchQuery
                            ? `No users found matching "${searchQuery}"`
                            : "No other users yet. Share the app!"}
                    </p>
                )}

                {filteredUsers?.map((user) => (
                    <UserListItem
                        key={user._id}
                        user={user}
                        onClick={() => onSelectUser(user._id)}
                    />
                ))}
            </div>
        </div>
    );
}
