"use client";

import type { PredictCategory } from "./types";
import { PredictCard } from "./predict-card";

type PredictGridProps = {
  categories: PredictCategory[];
  isStrategyLoading: boolean;
  onStartStrategy: (marketId: number) => void;
  pendingMarketIds: Set<number>;
  runningMarketIds: Set<number>;
};

export function PredictGrid({
  categories,
  isStrategyLoading,
  onStartStrategy,
  pendingMarketIds,
  runningMarketIds,
}: PredictGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {categories.map((category) => (
        <PredictCard
          category={category}
          isStrategyLoading={isStrategyLoading}
          key={category.id}
          onStartStrategy={onStartStrategy}
          pendingMarketIds={pendingMarketIds}
          runningMarketIds={runningMarketIds}
        />
      ))}
    </div>
  );
}
