"use client";

import { RefreshCw, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PredictFilters, PpRewardLevel } from "./types";

const rewardLevelOptions: Array<{ label: string; value: PpRewardLevel }> = [
  { label: "High PP", value: "high" },
  { label: "Low PP", value: "low" },
];

type PredictFiltersProps = {
  disabled?: boolean;
  filters: PredictFilters;
  onChange: (filters: PredictFilters) => void;
  onRefresh: () => void;
};

export function PredictFilters({
  disabled,
  filters,
  onChange,
  onRefresh,
}: PredictFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="inline-flex w-fit border border-white/10 bg-[#141419]">
        {rewardLevelOptions.map((option) => {
          const isActive = filters.ppRewardLevel === option.value;

          return (
            <Button
              className={cn(
                "h-8 rounded-none border-0 border-r border-white/10 px-4 text-[#aeb8d8] last:border-r-0 hover:bg-[#191920] hover:text-white",
                isActive && "bg-white/10 text-white",
              )}
              disabled={disabled}
              key={option.value}
              onClick={() => onChange({ ppRewardLevel: option.value })}
              type="button"
              variant="ghost"
            >
              <Trophy
                className={cn(
                  "size-3.5",
                  option.value === "high" ? "text-amber-300" : "text-sky-300",
                )}
              />
              {option.label}
            </Button>
          );
        })}
      </div>

      <Button
        aria-label="Refresh markets"
        className="h-8 w-fit rounded-none border-white/10 bg-[#141419] text-[#f4f7fb] hover:bg-[#191920]"
        disabled={disabled}
        onClick={onRefresh}
        size="sm"
        type="button"
        variant="outline"
      >
        <RefreshCw className="size-3.5" />
        Refresh
      </Button>
    </div>
  );
}
