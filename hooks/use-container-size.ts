"use client";

import { useCallback, useEffect, useState } from "react";

export type ContainerSize = { width: number; height: number };

export function useContainerSize<T extends HTMLElement = HTMLElement>(): [
  (el: T | null) => void,
  ContainerSize | null,
] {
  const [element, setElement] = useState<T | null>(null);
  const [size, setSize] = useState<ContainerSize | null>(null);

  const refCallback = useCallback((el: T | null) => {
    setElement(el);
  }, []);

  useEffect(() => {
    if (!element) {
      setSize(null);
      return;
    }
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect)
        setSize({ width: rect.width, height: rect.height });
    });
    ro.observe(element);
    return () => ro.disconnect();
  }, [element]);

  return [refCallback, size];
}
