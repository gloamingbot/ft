import { verifySession } from "@/lib/auth-guard";
import { StrategyPortfolio } from "@/components/strategy/strategy-portfolio";

export default async function PortfolioPage() {
  await verifySession();

  return (
    <div className="flex flex-1">
      <StrategyPortfolio />
    </div>
  );
}
