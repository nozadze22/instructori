"use client";

import { useCallback, useEffect, useState } from "react";

type UseNearViewportOptions = {
  /** Keep enabled once true (default true). */
  once?: boolean;
  rootMargin?: string;
};

/** Enables deferred data fetching when the element nears the viewport. */
const supportsIntersectionObserver =
  typeof IntersectionObserver !== "undefined";

export function useNearViewport(options?: UseNearViewportOptions) {
  const { once = true, rootMargin = "200px 0px" } = options ?? {};
  const [node, setNode] = useState<Element | null>(null);
  const [isNear, setIsNear] = useState(!supportsIntersectionObserver);

  const ref = useCallback((element: Element | null) => {
    setNode(element);
  }, []);

  useEffect(() => {
    if (!supportsIntersectionObserver || !node || (once && isNear)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNear(true);
        if (once) observer.disconnect();
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isNear, node, once, rootMargin]);

  return { ref, isNear };
}
