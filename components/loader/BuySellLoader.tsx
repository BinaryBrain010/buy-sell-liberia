"use client";

import Lottie from "lottie-react";
import animationData from "@/public/BuySellLoader.json";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * BuySellLoader
 * Reusable Lottie based loader. Accepts optional size + label.
 */
export function BuySellLoader({
  className,
  size = 140,
  loop = true,
  label = "Loading...",
  hideLabel = false,
  progress,
  showProgress = false,
  variant = "default",
  delayMs = 0,
}: {
  className?: string;
  size?: number;
  loop?: boolean;
  label?: string;
  hideLabel?: boolean;
  /** Optional numeric 0-100 to display progress */
  progress?: number;
  showProgress?: boolean;
  /** visual style variant */
  variant?: "default" | "subtle" | "inset" | "inline";
  /** delay render (ms) to avoid flash on super fast loads */
  delayMs?: number;
}) {
  const prefersReducedMotion = useReducedMotion();
  const [ready, setReady] = useState(delayMs === 0);
  useEffect(() => {
    if (delayMs > 0) {
      const t = setTimeout(() => setReady(true), delayMs);
      return () => clearTimeout(t);
    }
  }, [delayMs]);

  if (!ready) return null;

  const isInline = variant === "inline";
  const ringClasses = cn(
    "relative flex items-center justify-center rounded-full",
    variant === "inset" &&
      "bg-background/40 backdrop-blur border border-border/50",
    variant === "subtle" && "opacity-90",
    isInline && "rounded-none"
  );

  return (
    <div
      className={cn(
        isInline
          ? "inline-flex items-center justify-center select-none"
          : "flex flex-col items-center justify-center gap-4 select-none",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
        className={cn(
          "pointer-events-none",
          ringClasses,
          isInline && "w-auto h-auto"
        )}
      >
        {prefersReducedMotion ? (
          <div
            className="flex items-center justify-center w-full h-full"
            aria-hidden="true"
          >
            <div
              className={cn(
                "animate-pulse rounded-full bg-primary/30 border border-primary/40 shadow-inner",
                isInline ? "h-3 w-3" : "h-1/2 w-1/2"
              )}
            />
          </div>
        ) : (
          <Lottie
            animationData={animationData as any}
            loop={loop}
            autoplay
            style={{ width: size, height: size }}
          />
        )}
        {showProgress && typeof progress === "number" && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full mt-2 text-center">
            <div className="text-[11px] font-medium tabular-nums tracking-wide text-muted-foreground">
              {Math.min(100, Math.max(0, Math.round(progress)))}%
            </div>
          </div>
        )}
      </div>
      {!hideLabel && !isInline && (
        <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
          {label}
        </p>
      )}
      <span className="sr-only">{label}</span>
    </div>
  );
}

export default BuySellLoader;
