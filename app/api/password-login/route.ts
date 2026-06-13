import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  createAuthSessionValue,
} from "@/lib/auth-session";
import { verifyPassword } from "@/lib/auth";
import { isProtectedPath } from "@/lib/protected-routes";

const DEFAULT_NEXT_PATH = "/view";

function getSafeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return DEFAULT_NEXT_PATH;
  }

  return isProtectedPath(value) ? value : DEFAULT_NEXT_PATH;
}

function redirectToLogin(
  error: "missing" | "invalid",
  nextPath: string,
) {
  const loginParams = new URLSearchParams({
    error,
    next: nextPath,
  });

  return new NextResponse(null, {
    status: 303,
    headers: {
      Location: `/?${loginParams.toString()}`,
    },
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const accessCode = formData.get("accessCode");
  const nextPath = getSafeNextPath(formData.get("next"));

  if (typeof accessCode !== "string" || accessCode.length === 0) {
    return redirectToLogin("missing", nextPath);
  }

  if (!verifyPassword(accessCode)) {
    return redirectToLogin("invalid", nextPath);
  }

  const response = new NextResponse(null, {
    status: 303,
    headers: {
      Location: nextPath,
    },
  });

  response.cookies.set(AUTH_COOKIE_NAME, createAuthSessionValue(), {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
