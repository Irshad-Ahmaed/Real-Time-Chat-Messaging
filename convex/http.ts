import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

// Clerk webhook handler — receives user.created and user.updated events
// This ensures user profiles are synced even if the client-side fallback hasn't run
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // Parse the webhook payload
        const payload = await request.json();
        const eventType = payload.type;
        const userData = payload.data;

        if (eventType === "user.created" || eventType === "user.updated") {
            // Extract user info from Clerk event
            const clerkId = userData.id;
            const name =
                `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
                userData.username ||
                "Anonymous";
            const email = userData.email_addresses?.[0]?.email_address || "";
            const imageUrl = userData.image_url || "";

            // Upsert user in the database
            // We use an internal mutation that doesn't require auth
            const existingUser = await ctx.runQuery(
                internal.users.getUserByClerkId,
                { clerkId }
            );

            if (existingUser) {
                await ctx.runMutation(internal.users.updateUserByClerkId, {
                    clerkId,
                    name,
                    email,
                    imageUrl,
                });
            } else {
                await ctx.runMutation(internal.users.insertUser, {
                    clerkId,
                    name,
                    email,
                    imageUrl,
                });
            }
        }

        return new Response("OK", { status: 200 });
    }),
});

export default http;
