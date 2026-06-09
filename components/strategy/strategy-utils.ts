import type {
  StrategyMarketSummary,
  StrategyMarketsResponse,
  StrategyTarget,
} from "./types";

export function getRunningMarketIds(data?: StrategyMarketsResponse | null) {
  return new Set(data?.marketIds ?? []);
}

export function buildStrategyMarketSummaries(
  targets: StrategyTarget[],
): StrategyMarketSummary[] {
  const summaries = new Map<number, StrategyMarketSummary>();

  for (const target of targets) {
    const summary = summaries.get(target.marketId);

    if (summary) {
      summary.targets.push(target);
      summary.outcomeNames.push(target.outcomeName);
      continue;
    }

    summaries.set(target.marketId, {
      categorySlug: target.categorySlug,
      marketId: target.marketId,
      marketQuestion: target.marketQuestion,
      outcomeNames: [target.outcomeName],
      targets: [target],
    });
  }

  return Array.from(summaries.values()).sort(
    (left, right) => left.marketId - right.marketId,
  );
}

export function normalizeMarketId(value?: string | null) {
  if (!value) {
    return undefined;
  }

  const marketId = Number(value);

  return Number.isSafeInteger(marketId) && marketId > 0 ? marketId : undefined;
}
