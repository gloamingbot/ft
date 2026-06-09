export type PpRewardLevel = "high" | "low";

export type PredictFilters = {
  ppRewardLevel: PpRewardLevel;
};

export type PredictPpReward = {
  activeHourlyRate: number;
  hasActiveRewards: boolean;
  hasRewards: boolean;
  hourlyRate: number;
  level: "none" | PpRewardLevel;
  maxHourlyRate: number;
};

export type PredictMarket = {
  chancePercentage?: number | null;
  id: string;
  imageUrl?: string | null;
  isTradingEnabled?: boolean;
  outcomes?: {
    edges: Array<{
      node: {
        id: string;
        index: number;
        name: string;
      };
    }>;
  };
  ppReward?: PredictPpReward;
  question?: string | null;
  status?: string;
  title?: string | null;
};

export type PredictCategory = {
  comments?: {
    totalCount: number;
  };
  createdAt?: string;
  endsAt?: string | null;
  holdersCount?: number;
  id: string;
  imageUrl?: string | null;
  marketVariant?: string;
  markets?: {
    edges: Array<{
      node: PredictMarket;
    }>;
  };
  mobileImageUrl?: string | null;
  overrideImageUrl?: string | null;
  ppReward?: PredictPpReward;
  slug: string;
  startsAt?: string | null;
  statistics?: {
    liquidityValueUsd?: number | null;
    volume24hUsd?: number | null;
    volumeTotalUsd?: number | null;
  };
  status?: string;
  tags?: {
    edges: Array<{
      node: {
        id: string;
        name: string;
      };
    }>;
  };
  title: string;
};

export type PredictPageInfo = {
  endCursor: string | null;
  hasNextPage: boolean;
  startCursor: string | null;
};

export type PredictResponse = {
  data: PredictCategory[];
  meta?: {
    first: number;
    scannedCount: number;
    scanPageCount: number;
    sort: string;
  };
  pageInfo: PredictPageInfo;
  success: boolean;
  totalCount: number;
};
