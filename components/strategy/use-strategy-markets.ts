"use client";

import { useCallback, useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  addStrategyMarkets,
  fetchStrategyMarkets,
  removeStrategyMarket,
  removeStrategyMarkets,
} from "./strategy-api";
import type { StrategyMarketsResponse } from "./types";

type MutationRequest = () => Promise<StrategyMarketsResponse>;

export function useStrategyMarkets() {
  const [data, setData] = useState<StrategyMarketsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingMarketIds, setPendingMarketIds] = useState<Set<number>>(
    () => new Set(),
  );

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setIsLoading(true);

    try {
      const payload = await fetchStrategyMarkets({ signal });

      if (!signal?.aborted) {
        setData(payload);
        setError(null);
      }
    } catch (caughtError) {
      if (signal?.aborted) {
        return;
      }

      setError(getErrorMessage(caughtError));
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadInitialMarkets() {
      try {
        const payload = await fetchStrategyMarkets({
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setData(payload);
          setError(null);
        }
      } catch (caughtError) {
        if (controller.signal.aborted) {
          return;
        }

        setError(getErrorMessage(caughtError));
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadInitialMarkets();

    return () => controller.abort();
  }, []);

  const mutateMarketIds = useCallback(
    async (marketIds: number[], request: MutationRequest) => {
      const normalizedIds = Array.from(new Set(marketIds));

      if (normalizedIds.length === 0) {
        return data;
      }

      setPending(normalizedIds, true, setPendingMarketIds);

      try {
        const payload = await request();

        setData(payload);
        setError(null);

        return payload;
      } catch (caughtError) {
        setError(getErrorMessage(caughtError));
        throw caughtError;
      } finally {
        setPending(normalizedIds, false, setPendingMarketIds);
      }
    },
    [data],
  );

  const startMarket = useCallback(
    (marketId: number) =>
      mutateMarketIds([marketId], () => addStrategyMarkets([marketId])),
    [mutateMarketIds],
  );

  const stopMarket = useCallback(
    (marketId: number) =>
      mutateMarketIds([marketId], () => removeStrategyMarket(marketId)),
    [mutateMarketIds],
  );

  const stopMarkets = useCallback(
    (marketIds: number[]) =>
      mutateMarketIds(marketIds, () => removeStrategyMarkets(marketIds)),
    [mutateMarketIds],
  );

  return {
    data,
    error,
    isLoading,
    pendingMarketIds,
    refresh,
    startMarket,
    stopMarket,
    stopMarkets,
  };
}

function setPending(
  marketIds: number[],
  isPending: boolean,
  setPendingMarketIds: Dispatch<SetStateAction<Set<number>>>,
) {
  setPendingMarketIds((current) => {
    const next = new Set(current);

    for (const marketId of marketIds) {
      if (isPending) {
        next.add(marketId);
      } else {
        next.delete(marketId);
      }
    }

    return next;
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Strategy request failed.";
}
