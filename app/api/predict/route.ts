import { z } from "zod";

const PREDICT_GRAPHQL_URL = "https://graphql.predict.fun/graphql";
const DEFAULT_FIRST = 20;
const MAX_FIRST = 20;
const UPSTREAM_FIRST_WITH_REWARD_FILTER = 100;
const MAX_REWARD_FILTER_SCAN_PAGES = 10;

const PP_REWARD_LEVELS = {
  all: {},
  none: { min: 0, max: 0 },
  low: { min: 1, max: 499 },
  medium: { min: 100, max: 499 },
  high: { min: 500 },
  premium: { min: 1000 },
} as const;

const GET_CATEGORIES_QUERY = /* GraphQL */ `
  query GetCategories(
    $filter: CategoryFilterInput
    $sort: CategorySortInput
    $pagination: ForwardPaginationInput
    $marketsFilter: CategoryMarketsFilterInput
    $marketsPagination: ForwardPaginationInput
  ) {
    categories(filter: $filter, sort: $sort, pagination: $pagination) {
      totalCount
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
      edges {
        cursor
        node {
          createdAt
          id
          title
          imageUrl
          overrideImageUrl
          mobileImageUrl
          isNegRisk
          isYieldBearing
          slug
          isBookmarkedByUser
          startsAt
          endsAt
          holdersCount
          comments {
            totalCount
          }
          marketVariant
          resolutionProvider
          statistics {
            liquidity3CAskUsd
            liquidityValueUsd
            volumeTotalUsd
            volume24hUsd
            topWinUsd
          }
          titleTranslationKey
          markets(filter: $marketsFilter, pagination: $marketsPagination) {
            edges {
              node {
                ...Market
              }
            }
          }
          status
          tags {
            edges {
              node {
                name
                id
              }
            }
          }
          ... on CryptoUpDownCategory {
            marketData {
              marketId
              priceFeedId
              priceFeedSymbol
              priceFeedProvider
              startPrice
              startPricePublishTime
              endPrice
              endPricePublishTime
            }
          }
          ... on TweetCountCategory {
            marketData {
              marketId
              maxCount
              minCount
              xAccountUsername
            }
          }
        }
      }
    }
  }

  fragment MarketOutcome on Outcome {
    id
    name
    index
    onChainId
    status
    imageUrl
    positions {
      totalCount
    }
  }

  fragment Market on Market {
    id
    decimalPrecision
    feeMultiplier
    feeMultiplierStartTime
    feeMultiplierEndTime
    oracleQuestionId
    pointCapModifier
    rewardTimings {
      startTime
      endTime
      hourlyRate
    }
    category {
      id
      imageUrl
      isNegRisk
      isYieldBearing
      title
      startsAt
      endsAt
    }
    title
    question
    imageUrl
    chancePercentage
    spreadThreshold
    makerFeeBps
    takerFeeBps
    isTradingEnabled
    status
    shareThreshold
    statistics {
      percentageChanceChange24h
      volume24hUsd
      volume24hChangeUsd
      volumeTotalUsd
      totalLiquidityUsd
    }
    outcomes {
      edges {
        node {
          ...MarketOutcome
        }
      }
    }
    resolution {
      id
      name
      index
      status
      createdAt
    }
  }
`;

const nonEmptyStringSchema = z.string().trim().min(1).max(1024);
const ppRewardLevelSchema = z.enum([
  "all",
  "none",
  "low",
  "medium",
  "high",
  "premium",
]);
const rewardWindowSchema = z.enum(["any", "active"]);

const booleanParamSchema = z
  .union([z.boolean(), z.enum(["true", "false"])])
  .transform((value) => value === true || value === "true");

const getSearchParamsSchema = z.object({
  after: nonEmptyStringSchema.optional(),
  first: z.coerce.number().int().min(1).max(MAX_FIRST).default(DEFAULT_FIRST),
  hasPpRewards: booleanParamSchema.optional(),
  isLive: booleanParamSchema.optional(),
  marketStatus: nonEmptyStringSchema.default("OPEN"),
  marketVariants: z.array(nonEmptyStringSchema).default([]),
  maxPpRewardHourlyRate: z.coerce.number().int().min(0).optional(),
  minPpRewardHourlyRate: z.coerce.number().int().min(0).optional(),
  ppRewardLevel: ppRewardLevelSchema.default("all"),
  rewardWindow: rewardWindowSchema.default("active"),
  sort: nonEmptyStringSchema.default("PP_REWARDS_DESC"),
  status: nonEmptyStringSchema.default("OPEN"),
  tags: z.array(nonEmptyStringSchema).default([]),
});

const postBodySchema = getSearchParamsSchema
  .omit({
    marketVariants: true,
    tags: true,
  })
  .extend({
    marketVariants: z.array(nonEmptyStringSchema).default([]),
    tags: z.array(nonEmptyStringSchema).default([]),
  })
  .partial()
  .passthrough();

const rewardTimingSchema = z
  .object({
    endTime: nonEmptyStringSchema,
    hourlyRate: z.number(),
    startTime: nonEmptyStringSchema,
  })
  .passthrough();

const marketNodeSchema = z
  .object({
    rewardTimings: z.array(rewardTimingSchema).default([]),
  })
  .passthrough();

const marketEdgeSchema = z
  .object({
    node: marketNodeSchema,
  })
  .passthrough();

const categoryNodeSchema = z
  .object({
    markets: z
      .object({
        edges: z.array(marketEdgeSchema).default([]),
      })
      .passthrough(),
  })
  .passthrough();

const pageInfoSchema = z
  .object({
    endCursor: z.string().nullable().optional(),
    hasNextPage: z.boolean(),
    startCursor: z.string().nullable().optional(),
  })
  .passthrough();

const categoryEdgeSchema = z
  .object({
    cursor: z.string().nullable().optional(),
    node: categoryNodeSchema,
  })
  .passthrough();

const categoriesPayloadSchema = z
  .object({
    data: z.object({
      categories: z
        .object({
          edges: z.array(categoryEdgeSchema),
          pageInfo: pageInfoSchema,
          totalCount: z.number().optional(),
        })
        .passthrough(),
    }),
    errors: z.unknown().optional(),
  })
  .passthrough();

type PredictParams = z.infer<typeof getSearchParamsSchema>;
type RewardFilter = {
  max?: number;
  min?: number;
  window: z.infer<typeof rewardWindowSchema>;
};
type RewardTiming = z.infer<typeof rewardTimingSchema>;
type MarketNode = z.infer<typeof marketNodeSchema>;
type CategoryEdge = z.infer<typeof categoryEdgeSchema>;
type CategoriesPayload = z.infer<typeof categoriesPayloadSchema>;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const paramsResult = getSearchParamsSchema.safeParse({
    after: emptyToUndefined(searchParams.get("after")),
    first: emptyToUndefined(searchParams.get("first")),
    hasPpRewards: emptyToUndefined(searchParams.get("hasPpRewards")),
    isLive: emptyToUndefined(searchParams.get("isLive")),
    marketStatus: emptyToUndefined(searchParams.get("marketStatus")),
    marketVariants: getListParams(searchParams, [
      "marketVariant",
      "marketVariants",
    ]),
    maxPpRewardHourlyRate: emptyToUndefined(
      searchParams.get("maxPpRewardHourlyRate"),
    ),
    minPpRewardHourlyRate: emptyToUndefined(
      searchParams.get("minPpRewardHourlyRate"),
    ),
    ppRewardLevel: normalizeEnumParam(searchParams.get("ppRewardLevel")),
    rewardWindow: normalizeEnumParam(searchParams.get("rewardWindow")),
    sort: emptyToUndefined(searchParams.get("sort")),
    status: emptyToUndefined(searchParams.get("status")),
    tags: getListParams(searchParams, ["tag", "tags", "tagIds"]),
  });

  if (!paramsResult.success) {
    return validationErrorResponse(paramsResult.error);
  }

  return fetchPredictCategories(request, paramsResult.data);
}

export async function POST(request: Request) {
  const bodyResult = await readJsonBody(request);

  if (!bodyResult.success) {
    return bodyResult.response;
  }

  const bodyParseResult = postBodySchema.safeParse(bodyResult.data);

  if (!bodyParseResult.success) {
    return validationErrorResponse(bodyParseResult.error);
  }

  return fetchPredictCategories(request, {
    after: bodyParseResult.data.after,
    first: bodyParseResult.data.first ?? DEFAULT_FIRST,
    hasPpRewards: bodyParseResult.data.hasPpRewards,
    isLive: bodyParseResult.data.isLive,
    marketStatus: bodyParseResult.data.marketStatus ?? "OPEN",
    marketVariants: bodyParseResult.data.marketVariants ?? [],
    maxPpRewardHourlyRate: bodyParseResult.data.maxPpRewardHourlyRate,
    minPpRewardHourlyRate: bodyParseResult.data.minPpRewardHourlyRate,
    ppRewardLevel: bodyParseResult.data.ppRewardLevel ?? "all",
    rewardWindow: bodyParseResult.data.rewardWindow ?? "any",
    sort: bodyParseResult.data.sort ?? "PP_REWARDS_DESC",
    status: bodyParseResult.data.status ?? "OPEN",
    tags: bodyParseResult.data.tags ?? [],
  });
}

async function fetchPredictCategories(request: Request, params: PredictParams) {
  const rewardFilterResult = buildRewardFilter(params);

  if (!rewardFilterResult.success) {
    return badRequestResponse(rewardFilterResult.error);
  }

  const rewardFilter = rewardFilterResult.filter;
  const collectedEdges: CategoryEdge[] = [];
  let cursor = params.after;
  let lastPayload: CategoriesPayload | undefined;
  let scannedCount = 0;
  let scanPageCount = 0;

  do {
    const upstreamFirst = rewardFilter
      ? UPSTREAM_FIRST_WITH_REWARD_FILTER
      : params.first;
    const payloadResult = await requestPredictCategories(request, {
      ...params,
      after: cursor,
      first: upstreamFirst,
    });

    if (!payloadResult.success) {
      return payloadResult.response;
    }

    const payload = payloadResult.payload;
    const categories = payload.data.categories;
    const decoratedEdges = categories.edges.map((edge) =>
      decorateCategoryEdge(edge, params.rewardWindow),
    );
    const filteredEdges = rewardFilter
      ? decoratedEdges.filter((edge) => matchesRewardFilter(edge, rewardFilter))
      : decoratedEdges;

    for (const edge of filteredEdges) {
      collectedEdges.push(edge);
    }

    if (rewardFilter) {
      sortRewardEdges(collectedEdges, params.sort);
      collectedEdges.splice(params.first);
    }

    scannedCount += categories.edges.length;
    scanPageCount += 1;
    cursor = categories.pageInfo.endCursor ?? undefined;
    lastPayload = payload;

    if (!rewardFilter) {
      break;
    }
  } while (
    collectedEdges.length < params.first &&
    lastPayload?.data.categories.pageInfo.hasNextPage &&
    cursor &&
    scanPageCount < MAX_REWARD_FILTER_SCAN_PAGES
  );

  const pageInfo = lastPayload?.data.categories.pageInfo;

  return Response.json({
    success: true,
    data: collectedEdges.map((edge) => edge.node),
    pageInfo: {
      endCursor: pageInfo?.endCursor ?? null,
      hasNextPage: pageInfo?.hasNextPage ?? false,
      startCursor: collectedEdges[0]?.cursor ?? pageInfo?.startCursor ?? null,
    },
    totalCount: lastPayload?.data.categories.totalCount ?? 0,
    meta: {
      filters: {
        hasPpRewards: params.hasPpRewards,
        marketStatus: params.marketStatus,
        marketVariants: params.marketVariants,
        maxPpRewardHourlyRate: rewardFilter?.max,
        minPpRewardHourlyRate: rewardFilter?.min,
        ppRewardLevel: params.ppRewardLevel,
        rewardWindow: params.rewardWindow,
        status: params.status,
        tags: params.tags,
      },
      first: params.first,
      scannedCount,
      scanPageCount,
      sort: params.sort,
    },
  });
}

async function requestPredictCategories(
  request: Request,
  params: PredictParams,
): Promise<
  | { success: true; payload: CategoriesPayload }
  | { success: false; response: Response }
> {
  const response = await fetch(PREDICT_GRAPHQL_URL, {
    method: "POST",
    headers: buildPredictHeaders(request),
    body: JSON.stringify({
      operationName: "GetCategories",
      query: GET_CATEGORIES_QUERY,
      variables: {
        filter: {
          isLive: params.isLive,
          marketVariants: params.marketVariants,
          status: params.status,
          tags: params.tags,
        },
        marketsFilter: {
          status: params.marketStatus,
        },
        marketsPagination: {
          first: 100,
        },
        pagination: {
          after: params.after,
          first: params.first,
        },
        sort: params.sort,
      },
    }),
    cache: "no-store",
  });

  const jsonResult = await readJsonResponse(response);

  if (!jsonResult.success) {
    return {
      success: false,
      response: Response.json(
        {
          error: "Predict GraphQL returned a non-JSON response.",
          status: response.status,
          body: jsonResult.text,
        },
        { status: 502 },
      ),
    };
  }

  const payloadResult = categoriesPayloadSchema.safeParse(jsonResult.data);

  if (!response.ok) {
    return {
      success: false,
      response: Response.json(
        {
          error: "Predict GraphQL request failed.",
          status: response.status,
          payload: jsonResult.data,
        },
        { status: 502 },
      ),
    };
  }

  if (!payloadResult.success) {
    return {
      success: false,
      response: Response.json(
        {
          error: "Predict GraphQL returned an unexpected payload.",
          issues: payloadResult.error.issues,
        },
        { status: 502 },
      ),
    };
  }

  if (payloadResult.data.errors) {
    return {
      success: false,
      response: Response.json(
        {
          error: "Predict GraphQL returned errors.",
          errors: payloadResult.data.errors,
        },
        { status: 502 },
      ),
    };
  }

  return { success: true, payload: payloadResult.data };
}

function buildRewardFilter(
  params: PredictParams,
):
  | { success: true; filter?: RewardFilter }
  | { success: false; error: string } {
  const levelRange = PP_REWARD_LEVELS[params.ppRewardLevel];
  let min = "min" in levelRange ? levelRange.min : params.minPpRewardHourlyRate;
  let max = "max" in levelRange ? levelRange.max : params.maxPpRewardHourlyRate;

  if ("min" in levelRange && params.minPpRewardHourlyRate !== undefined) {
    min = Math.max(levelRange.min, params.minPpRewardHourlyRate);
  }

  if ("max" in levelRange && params.maxPpRewardHourlyRate !== undefined) {
    max = Math.min(levelRange.max, params.maxPpRewardHourlyRate);
  }

  if (params.hasPpRewards === true) {
    min = Math.max(min ?? 0, 1);
  }

  if (params.hasPpRewards === false) {
    max = Math.min(max ?? 0, 0);
  }

  if (min === undefined && max === undefined) {
    return { success: true };
  }

  if (min !== undefined && max !== undefined && min > max) {
    return {
      success: false,
      error: "minPpRewardHourlyRate must be less than or equal to maxPpRewardHourlyRate.",
    };
  }

  return {
    success: true,
    filter: {
      max,
      min,
      window: params.rewardWindow,
    },
  };
}

function decorateCategoryEdge(
  edge: CategoryEdge,
  rewardWindow: RewardFilter["window"],
): CategoryEdge {
  const marketEdges = edge.node.markets.edges.map((marketEdge) => ({
    ...marketEdge,
    node: decorateMarket(marketEdge.node, rewardWindow),
  }));
  const rewardTimings = marketEdges.flatMap((marketEdge) =>
    marketEdge.node.rewardTimings,
  );
  const maxHourlyRate = getMaxHourlyRate(rewardTimings);
  const activeHourlyRate = getMaxHourlyRate(getActiveRewardTimings(rewardTimings));
  const selectedHourlyRate =
    rewardWindow === "active" ? activeHourlyRate : maxHourlyRate;

  return {
    ...edge,
    node: {
      ...edge.node,
      markets: {
        ...edge.node.markets,
        edges: marketEdges,
      },
      ppReward: buildPpRewardSummary(
        selectedHourlyRate,
        maxHourlyRate,
        activeHourlyRate,
      ),
    },
  };
}

function decorateMarket(
  market: MarketNode,
  rewardWindow: RewardFilter["window"],
): MarketNode {
  const maxHourlyRate = getMaxHourlyRate(market.rewardTimings);
  const activeHourlyRate = getMaxHourlyRate(
    getActiveRewardTimings(market.rewardTimings),
  );
  const selectedHourlyRate =
    rewardWindow === "active" ? activeHourlyRate : maxHourlyRate;

  return {
    ...market,
    ppReward: buildPpRewardSummary(
      selectedHourlyRate,
      maxHourlyRate,
      activeHourlyRate,
    ),
  };
}

function buildPpRewardSummary(
  hourlyRate: number,
  maxHourlyRate: number,
  activeHourlyRate: number,
) {
  return {
    activeHourlyRate,
    hasActiveRewards: activeHourlyRate > 0,
    hasRewards: maxHourlyRate > 0,
    hourlyRate,
    level: getPpRewardLevel(hourlyRate),
    maxHourlyRate,
  };
}

function matchesRewardFilter(edge: CategoryEdge, filter: RewardFilter) {
  const reward = edge.node.ppReward as
    | { activeHourlyRate: number; maxHourlyRate: number }
    | undefined;
  const hourlyRate =
    filter.window === "active"
      ? reward?.activeHourlyRate ?? 0
      : reward?.maxHourlyRate ?? 0;

  return (
    (filter.min === undefined || hourlyRate >= filter.min) &&
    (filter.max === undefined || hourlyRate <= filter.max)
  );
}

function sortRewardEdges(edges: CategoryEdge[], sort: string) {
  if (sort === "PP_REWARDS_ASC") {
    edges.sort((left, right) => getEdgeRewardRate(left) - getEdgeRewardRate(right));
    return;
  }

  if (sort === "PP_REWARDS_DESC") {
    edges.sort((left, right) => getEdgeRewardRate(right) - getEdgeRewardRate(left));
  }
}

function getEdgeRewardRate(edge: CategoryEdge) {
  const reward = edge.node.ppReward as { hourlyRate: number } | undefined;

  return reward?.hourlyRate ?? 0;
}

function getActiveRewardTimings(rewardTimings: RewardTiming[]) {
  const now = Date.now();

  return rewardTimings.filter((timing) => {
    const startTime = new Date(timing.startTime).getTime();
    const endTime = new Date(timing.endTime).getTime();

    return startTime <= now && now < endTime;
  });
}

function getMaxHourlyRate(rewardTimings: RewardTiming[]) {
  return rewardTimings.reduce(
    (maxHourlyRate, timing) => Math.max(maxHourlyRate, timing.hourlyRate),
    0,
  );
}

function getPpRewardLevel(hourlyRate: number) {
  if (hourlyRate <= 0) {
    return "none";
  }

  return hourlyRate < 500 ? "low" : "high";
}

function buildPredictHeaders(request: Request) {
  const token =
    process.env.PREDICT_FUN_AUTH_TOKEN ?? process.env.PREDICT_FUN_TOKEN;
  const language =
    request.headers.get("x-accept-language") ??
    request.headers.get("accept-language")?.split(",")[0]?.trim() ??
    "zh-CN";
  const headers: Record<string, string> = {
    accept: "application/graphql-response+json, application/json",
    "accept-language": language,
    "content-type": "application/json",
    referer: "https://predict.fun/",
    "x-accept-language": language,
  };

  if (token) {
    headers.authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  return headers;
}

function getListParams(searchParams: URLSearchParams, names: string[]) {
  return names.flatMap((name) =>
    searchParams
      .getAll(name)
      .flatMap((value) => value.split(","))
      .map((value) => value.trim())
      .filter(Boolean),
  );
}

function normalizeEnumParam(value: string | null) {
  return value?.trim().toLowerCase() || undefined;
}

function emptyToUndefined(value: string | null) {
  return value?.trim() || undefined;
}

async function readJsonBody(
  request: Request,
): Promise<
  | { success: true; data: unknown }
  | { success: false; response: Response }
> {
  const text = await request.text();

  if (!text.trim()) {
    return { success: true, data: {} };
  }

  try {
    return { success: true, data: JSON.parse(text) as unknown };
  } catch {
    return {
      success: false,
      response: Response.json(
        { error: "Request body must be valid JSON." },
        { status: 400 },
      ),
    };
  }
}

async function readJsonResponse(
  response: Response,
): Promise<
  | { success: true; data: unknown }
  | { success: false; text: string }
> {
  const text = await response.text();

  try {
    return { success: true, data: JSON.parse(text) as unknown };
  } catch {
    return { success: false, text };
  }
}

function validationErrorResponse(error: z.ZodError) {
  return Response.json(
    {
      error: "Invalid predict request.",
      issues: error.issues,
    },
    { status: 400 },
  );
}

function badRequestResponse(error: string) {
  return Response.json({ error }, { status: 400 });
}
