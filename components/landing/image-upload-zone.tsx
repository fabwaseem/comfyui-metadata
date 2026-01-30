"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useRouter } from "next/navigation";
import { Upload, ImageIcon } from "lucide-react";
import { useSetImages } from "@/contexts/images-context";
import type { ResultItem } from "@/types";
import { cn } from "@/lib/utils";

const ACCEPT = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
};

type ImageUploadZoneProps = {
  noNavigate?: boolean;
};

export function ImageUploadZone({ noNavigate }: ImageUploadZoneProps = {}) {
  const router = useRouter();
  const setImages = useSetImages();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const results: ResultItem[] = acceptedFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        metadata: null,
        error: null,
      }));
      setImages({
        results,
        onClear: () => setImages(null),
        onAddMore: () => {},
      });
      if (!noNavigate) router.push("/app");
    },
    [noNavigate, router, setImages]
  );

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: true,
    maxSize: 25 * 1024 * 1024,
  });

  const inputProps = getInputProps();
  const rootProps = getRootProps({
    "aria-label":
      "Drop images or click to browse. Processed in your browser (PNG, JPG, WebP)",
  });

  return (
    <div
      {...rootProps}
      className={cn(
        "glass-card relative flex min-h-70 cursor-pointer flex-col items-center justify-center gap-4 border-2 border-dashed px-8 py-12 transition-[border-color,background-color] duration-200",
        "border-glass-border hover:border-primary/30",
        isDragActive && "border-primary/50 bg-primary/10",
        isDragAccept && "border-primary bg-primary/10",
        isDragReject && "border-destructive/50 bg-destructive/10"
      )}
    >
      <input {...inputProps} />
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-full transition-colors bg-muted/60",
          isDragActive && "bg-primary/20"
        )}
      >
        {isDragActive ? (
          <Upload className="size-8 text-primary" strokeWidth={1.5} />
        ) : (
          <ImageIcon
            className="size-8 text-muted-foreground"
            strokeWidth={1.5}
          />
        )}
      </div>
      <div className="text-center">
        <p className="font-medium text-foreground">
          {isDragActive
            ? "Drop images here"
            : "Drag & drop images here, or click to browse"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          PNG, JPG, WebP · Single or bulk · Stays on your device
        </p>
      </div>
    </div>
  );
}
