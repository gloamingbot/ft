import { timingSafeEqual } from "crypto"
import { betterAuth } from "better-auth"
import { env } from "@/lib/env"

export function verifyPassword(password: string) {
    const expectedPassword = Buffer.from(env.PASSWORD)
    const receivedPassword = Buffer.from(password)

    if (receivedPassword.length !== expectedPassword.length) {
        return false
    }

    return timingSafeEqual(receivedPassword, expectedPassword)
}

export const auth = betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
        enabled: true,
    },
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
            strategy: "jwt",
            refreshCache: true,
        },
    },
    account: {
        storeStateStrategy: "cookie",
        storeAccountCookie: true,
    }
})

export const { api } = auth;
