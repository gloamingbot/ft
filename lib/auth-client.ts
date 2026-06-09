import { createAuthClient } from "better-auth/react"
import { env } from "@/lib/env"


export const { signIn, signUp, useSession } = createAuthClient({
    baseURL: env.NEXT_PUBLIC_BASE_URL
})
