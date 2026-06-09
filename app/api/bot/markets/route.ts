import { proxyBotRequest, requireBotApiSession } from "@/lib/bot-api";

export const dynamic = "force-dynamic";

export async function GET() {
  const authResponse = await requireBotApiSession();

  if (authResponse) {
    return authResponse;
  }

  return proxyBotRequest("/markets", { method: "GET" });
}

export async function POST(request: Request) {
  const authResponse = await requireBotApiSession();

  if (authResponse) {
    return authResponse;
  }

  return proxyBotRequest("/markets", {
    body: await request.text(),
    method: "POST",
  });
}

export async function PUT(request: Request) {
  const authResponse = await requireBotApiSession();

  if (authResponse) {
    return authResponse;
  }

  return proxyBotRequest("/markets", {
    body: await request.text(),
    method: "PUT",
  });
}

export async function DELETE(request: Request) {
  const authResponse = await requireBotApiSession();

  if (authResponse) {
    return authResponse;
  }

  return proxyBotRequest("/markets", {
    body: await request.text(),
    method: "DELETE",
  });
}
