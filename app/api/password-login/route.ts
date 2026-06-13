import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_NAME,
  createAuthSessionValue,
} from "@/lib/auth-session";
import { verifyPassword } from "@/lib/auth";
import { isProtectedPath } from "@/lib/protected-routes";
import { getRequestOrigin, getRequestProtocol } from "@/lib/request-origin";

const DEFAULT_NEXT_PATH = "/view";

function getSafeNextPath(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return DEFAULT_NEXT_PATH;
  }

  return isProtectedPath(value) ? value : DEFAULT_NEXT_PATH;
}

function redirectToLogin(
  request: NextRequest,
  error: "missing" | "invalid",
  nextPath: string,
) {
  const loginUrl = new URL("/", getRequestOrigin(request));
  loginUrl.searchParams.set("error", error);
  loginUrl.searchParams.set("next", nextPath);

  return NextResponse.redirect(loginUrl, { status: 303 });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const accessCode = formData.get("accessCode");
  const nextPath = getSafeNextPath(formData.get("next"));

  if (typeof accessCode !== "string" || accessCode.length === 0) {
    return redirectToLogin(request, "missing", nextPath);
  }

  if (!verifyPassword(accessCode)) {
    return redirectToLogin(request, "invalid", nextPath);
  }

  const response = NextResponse.redirect(
    new URL(nextPath, getRequestOrigin(request)),
    { status: 303 },
  );

  response.cookies.set(AUTH_COOKIE_NAME, createAuthSessionValue(), {
    httpOnly: true,
    maxAge: AUTH_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: getRequestProtocol(request) === "https",
  });

  return response;
}
