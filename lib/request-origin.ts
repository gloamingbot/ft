import type { NextRequest } from "next/server";

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim();
}

export function getRequestOrigin(request: NextRequest) {
  const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
  const host = forwardedHost || request.headers.get("host");

  if (!host) {
    return request.nextUrl.origin;
  }

  return `${getRequestProtocol(request)}://${host}`;
}

export function getRequestProtocol(request: NextRequest) {
  const forwardedProto = firstHeaderValue(
    request.headers.get("x-forwarded-proto"),
  );

  return forwardedProto || request.nextUrl.protocol.replace(":", "");
}
