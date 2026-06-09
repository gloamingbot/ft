import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, verifyAuthSessionValue } from "@/lib/auth-session";
import { env } from "@/lib/env";

type BotRequestOptions = {
  body?: BodyInit | null;
  method: string;
};

export async function requireBotApiSession() {
  const session = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!session || !verifyAuthSessionValue(session)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  return null;
}

export async function proxyBotRequest(
  path: string,
  { body, method }: BotRequestOptions,
) {
  let response: Response;

  try {
    response = await fetch(getBotApiUrl(path), {
      body,
      cache: "no-store",
      headers: body ? { "content-type": "application/json" } : undefined,
      method,
    });
  } catch (error) {
    return Response.json(
      {
        error: "Bot API is unavailable.",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 502 },
    );
  }

  return proxyBotResponse(response);
}

function getBotApiUrl(path: string) {
  return new URL(path, normalizeBaseUrl(env.BOT_API_URL));
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

async function proxyBotResponse(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    return new Response(null, { status: response.status });
  }

  try {
    return Response.json(JSON.parse(text) as unknown, {
      status: response.status,
    });
  } catch {
    return Response.json(
      {
        error: "Bot API returned a non-JSON response.",
        body: text,
        status: response.status,
      },
      { status: 502 },
    );
  }
}
