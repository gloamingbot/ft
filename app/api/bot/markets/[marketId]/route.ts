import { proxyBotRequest, requireBotApiSession } from "@/lib/bot-api";

export const dynamic = "force-dynamic";

type RouteParams = {
  params: Promise<{
    marketId: string;
  }>;
};

export async function DELETE(_request: Request, { params }: RouteParams) {
  const authResponse = await requireBotApiSession();

  if (authResponse) {
    return authResponse;
  }

  const { marketId } = await params;
  const normalizedMarketId = Number(marketId);

  if (
    !Number.isSafeInteger(normalizedMarketId) ||
    normalizedMarketId <= 0
  ) {
    return Response.json(
      { error: "marketId must be a positive integer." },
      { status: 400 },
    );
  }

  return proxyBotRequest(`/markets/${normalizedMarketId}`, {
    method: "DELETE",
  });
}
