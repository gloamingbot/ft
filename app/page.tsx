import Hero from "@/components/hero";
import { isProtectedPath } from "@/lib/protected-routes";

const DEFAULT_NEXT_PATH = "/view";

type HomeSearchParams = Promise<{
  error?: string | string[];
  next?: string | string[];
}>;

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getLoginErrorMessage(error: string | undefined) {
  if (error === "missing") {
    return "Enter your access code.";
  }

  if (error === "invalid") {
    return "Invalid access code.";
  }

  return undefined;
}

function getSafeNextPath(next: string | undefined) {
  if (!next) {
    return DEFAULT_NEXT_PATH;
  }

  return isProtectedPath(next) ? next : DEFAULT_NEXT_PATH;
}

export default async function Home({
  searchParams,
}: {
  searchParams: HomeSearchParams;
}) {
  const params = await searchParams;
  const loginErrorMessage = getLoginErrorMessage(getFirstParam(params.error));
  const nextPath = getSafeNextPath(getFirstParam(params.next));

  return (
    <div className="container mx-auto flex flex-1 max-w-7xl items-center justify-center px-4 pb-32">
      <Hero loginErrorMessage={loginErrorMessage} nextPath={nextPath} />
    </div>
  );
}
