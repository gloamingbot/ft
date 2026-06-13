"use client";

import { useEffect, useId, useState } from "react";
import { LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type PasswordLoginFormProps = {
  errorMessage?: string;
  nextPath?: string;
};

export function PasswordLoginForm({
  errorMessage,
  nextPath = "/view",
}: PasswordLoginFormProps) {
  const accessCodeId = useId();
  const [submitting, setSubmitting] = useState(false);
  const isError = Boolean(errorMessage);

  useEffect(() => {
    if (!errorMessage) {
      return;
    }

    toast.error(errorMessage);
  }, [errorMessage]);

  return (
    <form
      action="/api/password-login"
      method="post"
      className="w-full max-w-md"
      onSubmit={() => setSubmitting(true)}
    >
      <input type="hidden" name="next" value={nextPath} />
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
              disabled={submitting}
              aria-invalid={isError}
              className="h-10 px-3 text-sm"
            />
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="h-10 w-full gap-2 px-4 sm:w-auto"
            >
              <LogIn aria-hidden="true" className="size-4" />
              {submitting ? "Checking..." : "Login"}
            </Button>
          </div>
        </Field>
      </FieldGroup>
    </form>
  );
}
