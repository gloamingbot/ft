import type { StrategyMarketsResponse } from "./types";

const STRATEGY_MARKETS_API = "/api/bot/markets";

type StrategyRequestOptions = {
  signal?: AbortSignal;
};

export async function fetchStrategyMarkets({
  signal,
}: StrategyRequestOptions = {}) {
  const response = await fetch(STRATEGY_MARKETS_API, {
    cache: "no-store",
    signal,
  });

  return readStrategyResponse(response);
}

export async function addStrategyMarkets(
  marketIds: number[],
  { signal }: StrategyRequestOptions = {},
) {
  const response = await fetch(STRATEGY_MARKETS_API, {
    body: JSON.stringify({ marketIds }),
    headers: { "content-type": "application/json" },
    method: "POST",
    signal,
  });

  return readStrategyResponse(response);
}

export async function removeStrategyMarkets(
  marketIds: number[],
  { signal }: StrategyRequestOptions = {},
) {
  const response = await fetch(STRATEGY_MARKETS_API, {
    body: JSON.stringify({ marketIds }),
    headers: { "content-type": "application/json" },
    method: "DELETE",
    signal,
  });

  return readStrategyResponse(response);
}

export async function removeStrategyMarket(
  marketId: number,
  { signal }: StrategyRequestOptions = {},
) {
  const response = await fetch(`${STRATEGY_MARKETS_API}/${marketId}`, {
    method: "DELETE",
    signal,
  });

  return readStrategyResponse(response);
}

async function readStrategyResponse(response: Response) {
  const payload = (await response.json()) as
    | StrategyMarketsResponse
    | { error?: string };

  if (!response.ok || !isStrategyMarketsResponse(payload)) {
    throw new Error(
      getResponseError(payload) ?? "Strategy markets request failed.",
    );
  }

  return payload;
}

function isStrategyMarketsResponse(
  payload: StrategyMarketsResponse | { error?: string },
): payload is StrategyMarketsResponse {
  return (
    Array.isArray((payload as StrategyMarketsResponse).marketIds) &&
    Array.isArray((payload as StrategyMarketsResponse).targets) &&
    typeof (payload as StrategyMarketsResponse).targetCount === "number"
  );
}

function getResponseError(payload: StrategyMarketsResponse | { error?: string }) {
  return "error" in payload && typeof payload.error === "string"
    ? payload.error
    : undefined;
}
