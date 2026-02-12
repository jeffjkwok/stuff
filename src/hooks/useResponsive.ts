import { useEffect, useState } from "react";
import { useDebounce } from "./useDebounce.ts";

type ResponsiveState = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

export const useResponsive = (): ResponsiveState => {
  const [state, setState] = useState<ResponsiveState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  const debouncedUpdate = useDebounce(() => {
    if (typeof window === "undefined") {
      return;
    }

    const width = window.innerWidth;
    const isMobile = width <= 768;
    const isTablet = width > 768 && width < 1024;
    const isDesktop = width >= 1024;

    setState({ isMobile, isTablet, isDesktop });
  }, 500);

  useEffect(() => {
    // initial run
    debouncedUpdate();

    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("resize", debouncedUpdate);

    return () => {
      window.removeEventListener("resize", debouncedUpdate);
    };
  }, [debouncedUpdate]);

  return state;
};
