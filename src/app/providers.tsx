"use client";

import { ThemeProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { useMotionMode } from "@/lib/useMotionMode";

function MotionBridge({ children }: { children: React.ReactNode }) {
  const mode = useMotionMode();
  return (
    <MotionConfig reducedMotion={mode === "reduced" ? "always" : "never"}>
      {children}
    </MotionConfig>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <MotionBridge>{children}</MotionBridge>
    </ThemeProvider>
  );
}
