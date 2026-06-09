import { cache } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AUTH_COOKIE_NAME, verifyAuthSessionValue } from "@/lib/auth-session"

export const verifySession = cache(async () => {
  const session = (await cookies()).get(AUTH_COOKIE_NAME)?.value

  if (!session || !verifyAuthSessionValue(session)) {
    redirect("/")
  }

  return { isAuth: true }
})
