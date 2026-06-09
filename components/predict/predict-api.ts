import type { PredictFilters, PredictResponse } from "./types";

type FetchPredictPageOptions = {
  after?: string;
  signal?: AbortSignal;
} & PredictFilters;

export async function fetchPredictPage({
  after,
  ppRewardLevel,
  signal,
}: FetchPredictPageOptions) {
  const params = new URLSearchParams({
    first: "20",
    marketStatus: "OPEN",
    ppRewardLevel,
    rewardWindow: "active",
    sort: "PP_REWARDS_DESC",
    status: "OPEN",
  });

  if (after) {
    params.set("after", after);
  }

  const response = await fetch(`/api/predict?${params.toString()}`, {
    signal,
  });
  const payload = (await response.json()) as PredictResponse | { error: string };

  if (!response.ok || !("success" in payload)) {
    throw new Error(
      "error" in payload ? payload.error : "Predict markets request failed.",
    );
  }

  return payload;
}
