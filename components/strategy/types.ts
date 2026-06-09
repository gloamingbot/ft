export type StrategyTarget = {
  categorySlug: string;
  marketId: number;
  marketQuestion: string;
  outcomeId: string;
  outcomeName: string;
};

export type StrategyMarketsResponse = {
  marketIds: number[];
  targetCount: number;
  targets: StrategyTarget[];
};

export type StrategyMarketSummary = {
  categorySlug: string;
  marketId: number;
  marketQuestion: string;
  outcomeNames: string[];
  targets: StrategyTarget[];
};
