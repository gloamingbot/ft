"use client";

import {
  ArrowUpRight,
  CircleCheck,
  Loader2,
  MessageSquare,
  Play,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { normalizeMarketId } from "@/components/strategy/strategy-utils";
import type { PredictCategory } from "./types";

type PredictCardProps = {
  category: PredictCategory;
  isStrategyLoading: boolean;
  onStartStrategy: (marketId: number) => void;
  pendingMarketIds: Set<number>;
  runningMarketIds: Set<number>;
};

export function PredictCard({
  category,
  isStrategyLoading,
  onStartStrategy,
  pendingMarketIds,
  runningMarketIds,
}: PredictCardProps) {
  const market = category.markets?.edges[0]?.node;
  const marketId = normalizeMarketId(market?.id);
  const isStrategyRunning =
    marketId !== undefined && runningMarketIds.has(marketId);
  const isStrategyPending =
    marketId !== undefined && pendingMarketIds.has(marketId);
  const ppReward = category.ppReward;
  const predictUrl = `https://predict.fun/zh-cn/market/${category.slug}`;
  const tag = getCardTag(category);
  const description = getDescription(category);
  const outcomes = market?.outcomes?.edges
    ?.map((edge) => edge.node.name)
    .slice(0, 3)
    .join(" / ");

  return (
    <article className="group flex min-h-67 flex-col border border-white/10 bg-[#15161a] transition-colors hover:border-white/20 hover:bg-[#191a1f]">
      <div className="flex flex-1 flex-col px-4 pt-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <span className="inline-flex max-w-[calc(100%-2rem)] items-center border border-white/20 px-2 py-1 font-mono text-[10px] font-semibold uppercase leading-none text-[#f4f7fb]">
            [{tag}]
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                aria-label="Open on Predict.fun"
                className="text-[#a9adba] transition-colors hover:text-white"
                href={predictUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ArrowUpRight className="size-4" />
              </a>
            </TooltipTrigger>
            <TooltipContent>Open market</TooltipContent>
          </Tooltip>
        </div>

        <h2 className="line-clamp-2 min-h-11 text-base font-bold leading-snug text-white">
          {category.title}
        </h2>
        <div className="mt-3 h-px bg-white/10" />

        <p className="mt-4 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-[#bbc5e8]">
          {description}
        </p>

        <div className="mt-auto space-y-3 pt-5">
          <div className="flex items-center justify-between gap-3 text-[11px] text-[#8990a3]">
            <span className="font-mono">
              Ends: {formatDate(category.endsAt ?? category.startsAt)}
            </span>
            {outcomes ? (
              <span className="truncate text-right font-mono">{outcomes}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#9ca3b5]">
            <span
              className={cn(
                "border px-2 py-1 font-mono uppercase leading-none",
                getRewardClass(ppReward?.level),
              )}
            >
              {formatReward(ppReward?.hourlyRate)}
            </span>
            {typeof market?.chancePercentage === "number" ? (
              <span className="border border-white/10 px-2 py-1 font-mono leading-none text-[#d6daf0]">
                {market.chancePercentage.toFixed(1)}%
              </span>
            ) : null}
            <span className="border border-white/10 px-2 py-1 font-mono uppercase leading-none text-[#d6daf0]">
              {category.status ?? "OPEN"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  aria-label={getStrategyButtonLabel({
                    isStrategyLoading,
                    isStrategyPending,
                    isStrategyRunning,
                    marketId,
                  })}
                  className="rounded-none border-transparent text-[#a9adba] hover:bg-white/5 hover:text-white"
                  aria-disabled={isStrategyRunning}
                  disabled={isStrategyLoading || isStrategyPending || !marketId}
                  onClick={() => {
                    if (!marketId || isStrategyRunning) {
                      return;
                    }

                    onStartStrategy(marketId);
                  }}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  {isStrategyPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : isStrategyRunning ? (
                    <CircleCheck className="size-4 text-emerald-300" />
                  ) : (
                    <Play className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {getStrategyButtonLabel({
                  isStrategyLoading,
                  isStrategyPending,
                  isStrategyRunning,
                  marketId,
                })}
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#8990a3]">
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" />
              {formatCompact(category.holdersCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3" />
              {formatCompact(category.comments?.totalCount)}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

function getStrategyButtonLabel({
  isStrategyLoading,
  isStrategyPending,
  isStrategyRunning,
  marketId,
}: {
  isStrategyLoading: boolean;
  isStrategyPending: boolean;
  isStrategyRunning: boolean;
  marketId?: number;
}) {
  if (!marketId) {
    return "缺少 market id";
  }

  if (isStrategyLoading) {
    return "读取策略状态";
  }

  if (isStrategyPending) {
    return "启动中";
  }

  return isStrategyRunning ? "策略运行中" : "启动策略";
}

function getCardTag(category: PredictCategory) {
  const categoryTag = category.tags?.edges[0]?.node.name;

  return (categoryTag ?? category.marketVariant ?? "market").replaceAll(
    "_",
    " ",
  );
}

function getDescription(category: PredictCategory) {
  const market = category.markets?.edges[0]?.node;

  return (
    market?.question ??
    market?.title ??
    category.tags?.edges.map((edge) => edge.node.name).join(" / ") ??
    "Open Predict.fun market"
  );
}

function formatDate(value?: string | null) {
  if (!value) {
    return "TBD";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "TBD";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatReward(value?: number) {
  if (!value) {
    return "0 PP/H";
  }

  return `${new Intl.NumberFormat("en", {
    maximumFractionDigits: 0,
  }).format(value)} PP/H`;
}

function formatCompact(value?: number) {
  if (!value) {
    return "0";
  }

  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}

function getRewardClass(level?: string) {
  switch (level) {
    case "high":
      return "border-amber-300/50 bg-amber-300/10 text-amber-200";
    case "low":
      return "border-sky-300/50 bg-sky-300/10 text-sky-200";
    default:
      return "border-white/10 bg-white/5 text-[#a9adba]";
  }
}
