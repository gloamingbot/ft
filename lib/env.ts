import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
    server: {
        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_URL: z.url(),
        PASSWORD: z.string().min(1),
        BOT_API_URL: z.url(),
    },
    client: {
        NEXT_PUBLIC_BASE_URL: z.url(),
    },
    // If you're using Next.js < 13.4.4, you'll need to specify the runtimeEnv manually
    runtimeEnv: {
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        PASSWORD: process.env.PASSWORD,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        BOT_API_URL: process.env.BOT_API_URL,
    },
    // For Next.js >= 13.4.4, you only need to destructure client variables:
    // experimental__runtimeEnv: {
    //   NEXT_PUBLIC_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
    // }
});
