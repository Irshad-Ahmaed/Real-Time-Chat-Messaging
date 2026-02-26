"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Users, Loader2, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function GroupChatDialog() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    const users = useQuery(api.users.getAllUsers);
    const createGroup = useMutation(api.conversations.createGroup);

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUsers.length < 2) return;

        setIsCreating(true);
        try {
            const conversationId = await createGroup({
                groupName: groupName.trim(),
                participantIds: selectedUsers,
            });
            setIsOpen(false);
            setGroupName("");
            setSelectedUsers([]);
            router.push(`/chat/${conversationId}`);
        } catch (error) {
            console.error("Failed to create group:", error);
        } finally {
            setIsCreating(false);
        }
    };

    const toggleUser = (userId: Id<"users">) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div
                    className="p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
                    title="New Group Chat"
                >
                    <Plus className="size-5" />
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create Group Chat</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-4">
                    <Input
                        placeholder="Group Name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="col-span-3"
                    />

                    <div>
                        <h4 className="text-sm font-medium mb-2">Select Members</h4>
                        <ScrollArea className="h-[200px] border rounded-md p-2">
                            {!users ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                </div>
                            ) : users.length === 0 ? (
                                <p className="text-sm text-center text-muted-foreground py-4">
                                    No other users found
                                </p>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    {users.map((user) => {
                                        const isSelected = selectedUsers.includes(user._id as Id<"users">);
                                        const initials = user.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .toUpperCase()
                                            .slice(0, 2);

                                        return (
                                            <div
                                                key={user._id}
                                                onClick={() => toggleUser(user._id as Id<"users">)}
                                                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? "bg-accent" : "hover:bg-muted"
                                                    }`}
                                            >
                                                <Avatar className="size-8">
                                                    <AvatarImage src={user.imageUrl} />
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                        {initials}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm font-medium flex-1 truncate">
                                                    {user.name}
                                                </span>
                                                <div className={`size-4 rounded-full border flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-muted-foreground"
                                                    }`}>
                                                    {isSelected && <div className="size-2 bg-primary-foreground rounded-full" />}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <Button
                        onClick={handleCreate}
                        disabled={isCreating || !groupName.trim() || selectedUsers.length < 2}
                        className="w-full"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="size-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Group"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
