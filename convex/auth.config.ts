import { AuthConfig } from "convex/server";

export default {
    providers: [
        {
            // Clerk JWT issuer domain — set CLERK_JWT_ISSUER_DOMAIN in Convex dashboard
            // or replace with your Clerk Frontend API URL
            domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
            applicationID: "convex",
        },
    ],
} satisfies AuthConfig;
