"use server"

import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  createAuthSessionValue,
} from "@/lib/auth-session"
import { verifyPassword } from "@/lib/auth"

export type LoginActionState = {
  status: "idle" | "success" | "error"
  message?: string
}

export async function loginWithAccessCode(
  _state: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const accessCode = formData.get("accessCode")

  if (typeof accessCode !== "string" || accessCode.length === 0) {
    return {
      status: "error",
      message: "Enter your access code.",
    }
  }

  if (!verifyPassword(accessCode)) {
    return {
      status: "error",
      message: "Invalid access code.",
    }
  }

  const cookieStore = await cookies()

  cookieStore.set(AUTH_COOKIE_NAME, createAuthSessionValue(), {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  revalidatePath("/")

  return {
    status: "success",
    message: "Access granted.",
  }
}
