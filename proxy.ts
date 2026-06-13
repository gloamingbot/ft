import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, verifyAuthSessionValue } from "@/lib/auth-session"
import { isProtectedPath } from "@/lib/protected-routes"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!isProtectedPath(pathname)) {
    return NextResponse.next()
  }

  const session = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (session && verifyAuthSessionValue(session)) {
    return NextResponse.next()
  }

  const loginParams = new URLSearchParams({ next: pathname })

  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: `/?${loginParams.toString()}`,
    },
  })
}

export const config = {
  matcher: ["/view/:path*", "/portfolio/:path*"],
}
