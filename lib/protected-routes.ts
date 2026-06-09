export const PROTECTED_PATHS = ["/view", "/portfolio"] as const

export function isProtectedPath(pathname: string) {
  return PROTECTED_PATHS.some(
    (protectedPath) =>
      pathname === protectedPath || pathname.startsWith(`${protectedPath}/`),
  )
}
