export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Sidebar will be added in Phase 2/3 */}
            <main className="flex-1">{children}</main>
        </div>
    );
}
