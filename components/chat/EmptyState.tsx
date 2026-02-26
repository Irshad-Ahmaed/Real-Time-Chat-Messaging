"use client";

import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
}

export default function EmptyState({
    icon: Icon,
    title,
    description,
}: EmptyStateProps) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
            <Icon className="size-14 text-muted-foreground/20" />
            <div>
                <h3 className="text-base font-medium text-muted-foreground">
                    {title}
                </h3>
                {description && (
                    <p className="text-sm text-muted-foreground/70 mt-1 max-w-xs">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
