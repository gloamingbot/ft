import { createHmac, randomUUID, timingSafeEqual } from "crypto"
import { env } from "@/lib/env"

export const AUTH_COOKIE_NAME = "password-authenticated"
export const AUTH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60

function signSessionPayload(payload: string) {
  return createHmac("sha256", env.PASSWORD).update(payload).digest("base64url")
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function createAuthSessionValue() {
  const payload = `${Date.now()}.${randomUUID()}`
  const signature = signSessionPayload(payload)

  return `${payload}.${signature}`
}

export function verifyAuthSessionValue(value: string) {
  const [issuedAt, nonce, signature] = value.split(".")

  if (!issuedAt || !nonce || !signature) {
    return false
  }

  const issuedAtTime = Number(issuedAt)

  if (
    !Number.isFinite(issuedAtTime) ||
    issuedAtTime > Date.now() ||
    Date.now() - issuedAtTime > AUTH_COOKIE_MAX_AGE * 1000
  ) {
    return false
  }

  const payload = `${issuedAt}.${nonce}`

  return safeEqual(signature, signSessionPayload(payload))
}
