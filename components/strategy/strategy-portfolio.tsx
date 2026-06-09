"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Bot, Loader2, RefreshCw, Search, Square } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { StrategyMarketCard } from "./strategy-market-card";
import {
  buildStrategyMarketSummaries,
  getRunningMarketIds,
} from "./strategy-utils";
import { useStrategyMarkets } from "./use-strategy-markets";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

export function StrategyPortfolio() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showStopAllDialog, setShowStopAllDialog] = useState(false);
  const {
    data,
    error,
    isLoading,
    pendingMarketIds,
    refresh,
    stopMarket,
    stopMarkets,
  } = useStrategyMarkets();
  const markets = useMemo(
    () => buildStrategyMarketSummaries(data?.targets ?? []),
    [data],
  );
  const filteredMarkets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return markets;
    }

    return markets.filter((market) =>
      [
        String(market.marketId),
        market.categorySlug,
        market.marketQuestion,
        ...market.outcomeNames,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [markets, searchQuery]);
  const runningMarketIds = useMemo(() => getRunningMarketIds(data), [data]);
  const isInitialLoading = isLoading && !data;
  const isMutating = pendingMarketIds.size > 0;

  async function handleRefresh() {
    await refresh();
  }

  async function handleStopMarket(marketId: number) {
    try {
      await stopMarket(marketId);
      toast.success("策略已停止");
    } catch (caughtError) {
      toast.error(getErrorMessage(caughtError));
    }
  }

  async function handleStopAll() {
    try {
      await stopMarkets(Array.from(runningMarketIds));
      setShowStopAllDialog(false);
      setSearchQuery("");
      toast.success("全部策略已停止");
    } catch (caughtError) {
      toast.error(getErrorMessage(caughtError));
    }
  }

  if (isInitialLoading) {
    return <PortfolioSkeleton />;
  }

  return (
    <motion.section
      animate="visible"
      className="w-full bg-[#08090b] px-4 py-8 text-[#f4f7fb] sm:py-10"
      initial="hidden"
      variants={containerVariants}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <motion.div className="flex flex-col gap-4" variants={itemVariants}>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-white">
                运行中的策略
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#aeb8d8]">
                {markets.length} markets · {data?.targetCount ?? 0} targets
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                className="h-8 rounded-none border-white/10 bg-[#141419] text-[#f4f7fb] hover:bg-[#191920]"
                disabled={isLoading || isMutating}
                onClick={handleRefresh}
                size="sm"
                type="button"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="size-3.5" />
                )}
                刷新
              </Button>
              {markets.length > 0 ? (
                <Button
                  className="h-8 rounded-none border-red-300/30 bg-red-300/10 text-red-100 hover:bg-red-300/20"
                  disabled={isMutating}
                  onClick={() => setShowStopAllDialog(true)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Square className="size-3.5 fill-current" />
                  全部停止
                </Button>
              ) : null}
            </div>
          </div>

          <div className="max-w-md">
            <Input
              className="h-9 rounded-none border-white/10 bg-[#141419] text-[#f4f7fb] placeholder:text-[#697086]"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="搜索 market、outcome 或 ID..."
              type="text"
              value={searchQuery}
            />
          </div>
        </motion.div>

        {error ? (
          <motion.div
            className="border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm text-red-100"
            variants={itemVariants}
          >
            {error}
          </motion.div>
        ) : null}

        <motion.div className="min-h-[360px]" variants={itemVariants}>
          {markets.length === 0 ? (
            <EmptyState />
          ) : filteredMarkets.length === 0 ? (
            <SearchEmptyState onClear={() => setSearchQuery("")} />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {filteredMarkets.map((market) => (
                <StrategyMarketCard
                  isPending={pendingMarketIds.has(market.marketId)}
                  key={market.marketId}
                  market={market}
                  onStop={(marketId) => void handleStopMarket(marketId)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {filteredMarkets.length > 0 ? (
          <motion.div
            className="text-center text-xs text-[#8990a3]"
            variants={itemVariants}
          >
            Showing {filteredMarkets.length} of {markets.length} running markets
          </motion.div>
        ) : null}
      </div>

      <Dialog open={showStopAllDialog} onOpenChange={setShowStopAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>停止全部策略？</DialogTitle>
            <DialogDescription>
              这会从 bot 当前订阅列表移除所有正在运行的 market。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => setShowStopAllDialog(false)}
              type="button"
              variant="outline"
            >
              取消
            </Button>
            <Button
              disabled={isMutating}
              onClick={() => void handleStopAll()}
              type="button"
              variant="destructive"
            >
              停止全部
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.section>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="w-full bg-[#08090b] px-4 py-8 text-[#f4f7fb] sm:py-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="space-y-3">
          <Skeleton className="h-8 w-56 bg-white/10" />
          <Skeleton className="h-4 w-44 bg-white/10" />
          <Skeleton className="h-9 w-full max-w-md bg-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              className="min-h-[244px] animate-pulse border border-white/10 bg-[#15161a] p-4"
              key={index}
            >
              <div className="mb-5 flex items-center justify-between">
                <div className="h-6 w-32 bg-white/10" />
                <div className="h-4 w-4 bg-white/10" />
              </div>
              <div className="h-5 w-3/4 bg-white/10" />
              <div className="mt-3 h-px bg-white/10" />
              <div className="mt-5 flex gap-2">
                <div className="h-6 w-16 bg-white/10" />
                <div className="h-6 w-16 bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center border border-white/10 bg-[#15161a] p-8 text-center">
      <div className="mb-4 flex size-14 items-center justify-center border border-white/10 bg-white/5">
        <Bot className="size-7 text-[#8990a3]" />
      </div>
      <h2 className="text-base font-semibold text-white">还没有运行中的策略</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-[#aeb8d8]">
        在 View 页面点击 market 卡片的启动策略按钮后，会出现在这里。
      </p>
      <Button
        asChild
        className="mt-5 h-8 rounded-none px-4"
        size="sm"
      >
        <Link href="/view">去启动策略</Link>
      </Button>
    </div>
  );
}

function SearchEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center border border-white/10 bg-[#15161a] p-8 text-center">
      <div className="mb-4 flex size-14 items-center justify-center border border-white/10 bg-white/5">
        <Search className="size-7 text-[#8990a3]" />
      </div>
      <h2 className="text-base font-semibold text-white">没有匹配的 market</h2>
      <p className="mt-2 text-sm text-[#aeb8d8]">换一个关键词或清空搜索。</p>
      <Button
        className="mt-5 h-8 rounded-none border-white/10 bg-[#141419] text-[#f4f7fb] hover:bg-[#191920]"
        onClick={onClear}
        size="sm"
        type="button"
        variant="outline"
      >
        清空搜索
      </Button>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Strategy request failed.";
}
