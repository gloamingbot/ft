import { verifySession } from "@/lib/auth-guard";
import { PredictBoard } from "@/components/predict/predict-board";

export default async function ViewPage() {
  await verifySession();

  return (
    <div className="flex flex-1">
      <PredictBoard />
    </div>
  );
}
