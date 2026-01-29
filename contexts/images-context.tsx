"use client";

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { ResultItem } from "@/types";

export type Images = {
  results: ResultItem[];
  onClear: () => void;
  onAddMore: (files: File[]) => void;
} | null;

type ImagesContextValue = {
  images: Images;
  setImages: Dispatch<SetStateAction<Images>>;
};

const ImagesContext = createContext<ImagesContextValue | null>(null);

export function ExtractionStateProvider({ children }: { children: ReactNode }) {
  const [images, setImages] = useState<Images>(null);

  return (
    <ImagesContext.Provider value={{ images, setImages }}>
      {children}
    </ImagesContext.Provider>
  );
}

export function useImages(): ImagesContextValue {
  const ctx = useContext(ImagesContext);
  if (!ctx) {
    throw new Error(
      "useExtractionState must be used within ExtractionStateProvider"
    );
  }
  return ctx;
}

export function useSetImages(): Dispatch<SetStateAction<Images>> {
  const ctx = useContext(ImagesContext);
  if (!ctx) {
    throw new Error("useSetImages must be used within ImagesProvider");
  }
  return ctx.setImages;
}
