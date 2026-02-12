/* eslint-disable  @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from "react";

type AnyFn = (...args: any[]) => void;

export function useDebounce<T extends AnyFn>(fn: T, delay: number) {
  const fnRef = useRef<T>(fn);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always keep latest function
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay],
  );

  return debounced;
}
