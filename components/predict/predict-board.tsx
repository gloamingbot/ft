"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getRunningMarketIds } from "@/components/strategy/strategy-utils";
import { useStrategyMarkets } from "@/components/strategy/use-strategy-markets";
import { fetchPredictPage } from "./predict-api";
import { PredictFilters } from "./predict-filters";
import { PredictGrid } from "./predict-grid";
import { PredictSkeleton } from "./predict-skeleton";
import type {
  PredictCategory,
  PredictFilters as PredictFiltersValue,
  PredictPageInfo,
} from "./types";

const initialFilters: PredictFiltersValue = {
  ppRewardLevel: "high",
};

type RequestState = {
  after?: string;
  filters: PredictFiltersValue;
  mode: "append" | "replace";
  sequence: number;
};

type LoadState = "idle" | "loading" | "loading-more" | "error";

export function PredictBoard() {
  const [categories, setCategories] = useState<PredictCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [pageInfo, setPageInfo] = useState<PredictPageInfo | null>(null);
  const [request, setRequest] = useState<RequestState>({
    filters: initialFilters,
    mode: "replace",
    sequence: 0,
  });
  const {
    data: strategyMarkets,
    error: strategyError,
    isLoading: isStrategyLoading,
    pendingMarketIds,
    startMarket,
  } = useStrategyMarkets();
  const isBusy = loadState === "loading" || loadState === "loading-more";
  const runningMarketIds = useMemo(
    () => getRunningMarketIds(strategyMarkets),
    [strategyMarkets],
  );
  const visibleCount = categories.length;
  const rewardLabel = useMemo(
    () => getRewardLabel(filters.ppRewardLevel),
    [filters.ppRewardLevel],
  );

  useEffect(() => {
    const controller = new AbortController();

    fetchPredictPage({
      ...request.filters,
      after: request.after,
      signal: controller.signal,
    })
      .then((payload) => {
        setCategories((current) =>
          request.mode === "append"
            ? mergeCategories(current, payload.data)
            : payload.data,
        );
        setPageInfo(payload.pageInfo);
        setError(null);
        setLoadState("idle");
      })
      .catch((caughtError: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Predict markets request failed.",
        );
        setLoadState("error");
      });

    return () => controller.abort();
  }, [request]);

  function requestFirstPage(nextFilters: PredictFiltersValue) {
    setFilters(nextFilters);
    setCategories([]);
    setError(null);
    setLoadState("loading");
    setPageInfo(null);
    setRequest((current) => ({
      filters: nextFilters,
      mode: "replace",
      sequence: current.sequence + 1,
    }));
  }

  function refresh() {
    requestFirstPage(filters);
  }

  function loadMore() {
    if (!pageInfo?.endCursor || isBusy) {
      return;
    }

    setError(null);
    setLoadState("loading-more");
    setRequest((current) => ({
      after: pageInfo.endCursor ?? undefined,
      filters,
      mode: "append",
      sequence: current.sequence + 1,
    }));
  }

  async function handleStartStrategy(marketId: number) {
    if (runningMarketIds.has(marketId)) {
      return;
    }

    try {
      await startMarket(marketId);
      toast.success("策略已启动");
    } catch (caughtError) {
      toast.error(
        caughtError instanceof Error
          ? caughtError.message
          : "Strategy request failed.",
      );
    }
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#08090b] px-4 py-8 text-[#f4f7fb] sm:py-10"
      initial={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-white">
                PP reward board
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[#aeb8d8]">
                {rewardLabel} · {visibleCount} visible · 20 per page
              </p>
            </div>
          </div>
        </div>

        <PredictFilters
          disabled={isBusy}
          filters={filters}
          onChange={requestFirstPage}
          onRefresh={refresh}
        />

        {error ? (
          <div className="border border-red-300/30 bg-red-300/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        {strategyError ? (
          <div className="border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
            {strategyError}
          </div>
        ) : null}

        {loadState === "loading" ? (
          <PredictSkeleton />
        ) : categories.length > 0 ? (
          <PredictGrid
            categories={categories}
            isStrategyLoading={isStrategyLoading}
            onStartStrategy={(marketId) => void handleStartStrategy(marketId)}
            pendingMarketIds={pendingMarketIds}
            runningMarketIds={runningMarketIds}
          />
        ) : (
          <div className="flex min-h-[268px] items-center justify-center border border-white/10 bg-[#15161a] p-8 text-center text-sm text-[#aeb8d8]">
            No open markets match the selected filters.
          </div>
        )}

        <div className="flex justify-center pt-2">
          <Button
            className="h-9 rounded-none border-white/10 bg-[#141419] px-5 text-[#f4f7fb] hover:bg-[#191920]"
            disabled={!pageInfo?.hasNextPage || isBusy}
            onClick={loadMore}
            type="button"
            variant="outline"
          >
            {loadState === "loading-more" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : null}
            {getPaginationLabel(loadState, pageInfo?.hasNextPage)}
          </Button>
        </div>
      </div>
    </motion.section>
  );
}

function getPaginationLabel(loadState: LoadState, hasNextPage?: boolean) {
  if (loadState === "loading-more") {
    return "Loading...";
  }

  return hasNextPage ? "Load more" : "No more";
}

function mergeCategories(
  current: PredictCategory[],
  incoming: PredictCategory[],
) {
  const seen = new Set(current.map((category) => category.id));
  const next = [...current];

  for (const category of incoming) {
    if (!seen.has(category.id)) {
      next.push(category);
      seen.add(category.id);
    }
  }

  return next;
}

function getRewardLabel(level: PredictFiltersValue["ppRewardLevel"]) {
  switch (level) {
    case "high":
      return "High PP rewards";
    case "low":
      return "Low PP rewards";
  }
}
