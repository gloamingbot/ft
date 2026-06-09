"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { ThemeProvider } from "./theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </ThemeProvider>
  );
}
