"use client";

import React from "react";
import BuySellLoader from "./BuySellLoader";

type Props = {
  /** Minimum time (ms) to keep the loader visible to avoid flicker */
  minDuration?: number;
  /** Wait for full window 'load' event (images/fonts/etc). If false, hides on idle. */
  waitForWindowLoad?: boolean;
  /** Optional custom label for the loader */
  label?: string;
};

/**
 * PageLoaderOverlay
 * Shows a full-screen loader on the client until the page is fully loaded.
 * Useful when you want to hold the UI until images and client code are ready.
 */
export default function PageLoaderOverlay({
  minDuration = 600,
  waitForWindowLoad = true,
  label = "Loading marketplace",
}: Props) {
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    const start = Date.now();

    const finish = () => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, minDuration - elapsed);
      const t = setTimeout(() => {
        if (!cancelled) setVisible(false);
      }, remaining);
      return () => clearTimeout(t);
    };

    if (waitForWindowLoad && typeof window !== "undefined") {
      if (document.readyState === "complete") {
        // Already fully loaded
        return finish();
      }
      const onLoad = () => {
        cleanupFinish = finish();
        window.removeEventListener("load", onLoad);
      };
      window.addEventListener("load", onLoad);
      // Fallback timeout in case 'load' never fires
      const fallback = setTimeout(() => {
        cleanupFinish = finish();
        window.removeEventListener("load", onLoad);
      }, 8000);

      let cleanupFinish: (() => void) | undefined;
      return () => {
        cancelled = true;
        window.removeEventListener("load", onLoad);
        clearTimeout(fallback);
        cleanupFinish?.();
      };
    } else {
      // No window load waiting; hide when browser is idle or after short delay
      const ric = (window as any)?.requestIdleCallback as
        | undefined
        | ((cb: () => void, opts?: { timeout?: number }) => number);
      let idleId: number | undefined;
      let timeoutId: ReturnType<typeof setTimeout> | undefined;
      if (ric) {
        idleId = ric(() => finish(), { timeout: 1500 }) as unknown as number;
      } else {
        timeoutId = setTimeout(() => finish(), 800);
      }
      return () => {
        cancelled = true;
        if ((window as any)?.cancelIdleCallback && idleId) {
          (window as any).cancelIdleCallback(idleId);
        }
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, [minDuration, waitForWindowLoad]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm flex items-center justify-center">
      <BuySellLoader size={160} label={label} />
    </div>
  );
}
