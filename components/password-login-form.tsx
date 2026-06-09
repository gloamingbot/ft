"use client";

import { useActionState, useEffect, useId } from "react";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  loginWithAccessCode,
  type LoginActionState,
} from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const initialState: LoginActionState = {
  status: "idle",
};

export function PasswordLoginForm() {
  const router = useRouter();
  const accessCodeId = useId();
  const [state, action, pending] = useActionState(
    loginWithAccessCode,
    initialState,
  );
  const isError = state.status === "error";

  useEffect(() => {
    if (!state.message || state.status === "idle") {
      return;
    }

    if (state.status === "success") {
      toast.success(state.message);
      router.replace("/view");
      return;
    }

    toast.error(state.message);
  }, [router, state]);

  return (
    <form action={action} className="w-full max-w-md">
      <FieldGroup className="gap-3">
        <Field data-invalid={isError}>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Input
              id={accessCodeId}
              name="accessCode"
              type="password"
              autoComplete="current-password"
              aria-label="Access code"
              placeholder="Enter access code"
              required
              disabled={pending}
              aria-invalid={isError}
              className="h-10 px-3 text-sm"
            />
            <Button
              type="submit"
              size="lg"
              disabled={pending}
              className="h-10 w-full gap-2 px-4 sm:w-auto"
            >
              <LogIn aria-hidden="true" className="size-4" />
              {pending ? "Checking..." : "Login"}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
