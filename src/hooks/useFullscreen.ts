import { useCallback, useEffect, useState } from "react";

/**
 * Wraps the browser Fullscreen API so the background (ambient gradient,
 * or a user's own image/video loop) can fill the entire screen with no
 * browser chrome. Feature-detected: on browsers/platforms that don't
 * support it (notably iOS Safari for arbitrary elements), `isSupported`
 * is false so callers can simply hide the control.
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== "undefined" && !!document.fullscreenElement,
  );

  const isSupported =
    typeof document !== "undefined" && typeof document.documentElement.requestFullscreen === "function";

  useEffect(() => {
    function onChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(() => {
    document.documentElement.requestFullscreen?.().catch(() => {
      // Some browsers reject this outside a direct user gesture — nothing
      // to do but leave the person in windowed mode.
    });
  }, []);

  const exit = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {
        // ignore
      });
    }
  }, []);

  const toggle = useCallback(() => {
    if (document.fullscreenElement) exit();
    else enter();
  }, [enter, exit]);

  return { isFullscreen, isSupported, enter, exit, toggle };
}
