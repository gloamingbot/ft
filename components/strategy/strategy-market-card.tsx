"use client";

import { ArrowUpRight, Loader2, Square, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StrategyMarketSummary } from "./types";

type StrategyMarketCardProps = {
  isPending: boolean;
  market: StrategyMarketSummary;
  onStop: (marketId: number) => void;
};

export function StrategyMarketCard({
  isPending,
  market,
  onStop,
}: StrategyMarketCardProps) {
  const predictUrl = `https://predict.fun/zh-cn/market/${market.categorySlug}`;
  const visibleOutcomes = market.outcomeNames.slice(0, 4);
  const hiddenOutcomeCount = Math.max(0, market.outcomeNames.length - 4);

  return (
    <article className="group flex min-h-61 flex-col border border-white/10 bg-[#15161a] transition-colors hover:border-white/20 hover:bg-[#191a1f]">
      <div className="flex flex-1 flex-col px-4 pt-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="inline-flex max-w-[calc(100%-2rem)] items-center border border-emerald-300/40 bg-emerald-300/10 px-2 py-1 font-mono text-[10px] font-semibold uppercase leading-none text-emerald-200">
            RUNNING #{market.marketId}
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                aria-label="打开 Predict.fun market"
                className="text-[#a9adba] transition-colors hover:text-white"
                href={predictUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ArrowUpRight className="size-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>打开 market</TooltipContent>
          </Tooltip>
        </div>

        <h2 className="line-clamp-2 min-h-11 text-base font-bold leading-snug text-white">
          {market.marketQuestion}
        </h2>
        <div className="mt-3 h-px bg-white/10" />

        <div className="mt-4 flex flex-wrap gap-2">
          {visibleOutcomes.map((outcomeName) => (
            <span
              className="border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] leading-none text-[#d6daf0]"
              key={outcomeName}
            >
              {outcomeName}
            </span>
          ))}
          {hiddenOutcomeCount > 0 ? (
            <span className="border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] leading-none text-[#8990a3]">
              +{hiddenOutcomeCount}
            </span>
          ) : null}
        </div>

        <div className="mt-auto flex items-center gap-2 pt-5 text-[11px] text-[#8990a3]">
          <Target className="size-3" />
          <span className="font-mono">{market.targets.length} targets</span>
          <span className="truncate font-mono">/{market.categorySlug}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#8990a3]">策略运行中</span>
          <Button
            className="h-8 rounded-none border-red-300/30 bg-red-300/10 px-3 text-red-100 hover:bg-red-300/20"
            disabled={isPending}
            onClick={() => onStop(market.marketId)}
            size="sm"
            type="button"
            variant="outline"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Square className="size-3.5 fill-current" />
            )}
            停止策略
          </Button>
        </div>
      </div>
    </article>
  );
}
