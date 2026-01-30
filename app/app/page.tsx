"use client";

import { useEffect, useRef, useState, memo } from "react";
import dynamic from "next/dynamic";
import { useImages } from "@/contexts/images-context";
import { ImageUploadZone } from "@/components/landing/image-upload-zone";
import { extractMetadata as fetchMetadata } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Check,
  ImageIcon,
  AlertCircle,
  Plus,
  Trash2,
  List,
  PanelTop,
  Layers,
  Link2,
  PanelLeft,
  PanelLeftClose,
} from "lucide-react";
import { AddByUrlDialog } from "@/components/app/add-by-url-dialog";
import { Button } from "@/components/ui/button";

const Masonry = dynamic(
  () => import("react-masonry-css").then((m) => m.default),
  { ssr: false }
);
import { cn, formatFileSize } from "@/lib/utils";
import { useContainerSize } from "@/hooks/use-container-size";
import { useAppLayout } from "@/contexts/app-layout-context";
import type { ResultItem } from "@/types";

type ViewMode = "list" | "grid-detail" | "masonry";

function useExtractMetadata() {
  const { images, setImages } = useImages();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const results = images?.results;
    if (!results?.length || !images) return;
    const needsExtraction = results.filter(
      (r) => r.metadata === null && !r.error
    );
    if (needsExtraction.length === 0) return;

    setLoading(true);
    Promise.all(
      results.map(async (r): Promise<ResultItem> => {
        if (r.metadata !== null || r.error) return r;
        const { metadata, error } = await fetchMetadata(r.file);
        return {
          ...r,
          metadata: metadata ?? null,
          error,
        };
      })
    ).then((updated) => {
      setImages({
        ...images,
        results: updated,
      });
      setLoading(false);
    });
  }, [images?.results?.length, images, setImages]);

  return loading;
}

const ImageCard = memo(function ImageCard({
  item,
  loading,
  onRemove,
  layout = "horizontal",
  fixedImageHeight = false,
}: {
  item: ResultItem;
  loading: boolean;
  onRemove: (item: ResultItem) => void;
  layout?: "horizontal" | "vertical";
  fixedImageHeight?: boolean;
}) {
  const [copiedPositive, setCopiedPositive] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);
  const prompt = item.metadata?.prompt ?? null;
  const hasPositive = !!prompt?.positive?.trim();
  const hasNegative = !!prompt?.negative?.trim();
  const hasPrompt = hasPositive || hasNegative;
  const isLoading = loading && !item.metadata && !item.error;

  const copyPositive = async () => {
    if (!hasPositive || !prompt?.positive) return;
    await navigator.clipboard.writeText(prompt.positive);
    setCopiedPositive(true);
    setTimeout(() => setCopiedPositive(false), 2000);
  };

  const copyNegative = async () => {
    if (!hasNegative || !prompt?.negative) return;
    await navigator.clipboard.writeText(prompt.negative);
    setCopiedNegative(true);
    setTimeout(() => setCopiedNegative(false), 2000);
  };

  const imageBlock = (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden bg-muted",
        layout === "horizontal" && "flex w-40 sm:w-52",
        layout === "vertical" && "w-full",
        layout === "vertical" && fixedImageHeight && "h-52 sm:h-56"
      )}
    >
      <img
        src={item.preview}
        alt={item.file.name}
        width={item.metadata?.width ?? undefined}
        height={item.metadata?.height ?? undefined}
        loading="lazy"
        decoding="async"
        className={cn(
          layout === "horizontal"
            ? "size-full object-cover"
            : fixedImageHeight
            ? "size-full object-contain"
            : "w-full h-auto object-contain"
        )}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70">
          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );

  const contentBlock = (
    <div className="flex min-w-0 flex-1 items-start gap-4 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {item.file.name}
            </span>
            <span className="text-xs text-muted-foreground">
              {item.metadata?.width != null && item.metadata?.height != null
                ? `${item.metadata.width} × ${item.metadata.height} · `
                : null}
              {formatFileSize(item.file.size)}
            </span>
          </div>
          {item.error && (
            <Badge variant="destructive" className="shrink-0 text-xs">
              <AlertCircle className="mr-1 size-3" />
              Error
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            onClick={() => onRemove(item)}
            aria-label="Remove image"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        {item.error ? (
          <p className="mt-2 text-sm text-destructive">{item.error}</p>
        ) : hasPrompt ? (
          <>
            {hasPositive && (
              <div className="mt-2 flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground/80">
                    Positive
                  </p>
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {prompt!.positive}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={copyPositive}
                  aria-label="Copy positive prompt"
                >
                  {copiedPositive ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            )}
            {hasNegative && (
              <div className="mt-2 flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground/80">
                    Negative
                  </p>
                  <p className="line-clamp-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {prompt!.negative}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={copyNegative}
                  aria-label="Copy negative prompt"
                >
                  {copiedNegative ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            )}
            {item.metadata?.models?.length ? (
              <p className="mt-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground/80">Models: </span>
                {item.metadata.models.join(", ")}
              </p>
            ) : null}
          </>
        ) : isLoading ? (
          <div className="mt-2 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground/60">
            No prompts found
          </p>
        )}
      </div>
    </div>
  );

  if (layout === "vertical") {
    return (
      <div className="glass-card group flex min-h-0 flex-col overflow-hidden transition-colors hover:bg-muted/20">
        {imageBlock}
        {contentBlock}
      </div>
    );
  }

  return (
    <div className="glass-card group flex min-h-0 overflow-hidden transition-colors hover:bg-muted/20">
      {imageBlock}
      {contentBlock}
    </div>
  );
});

const MASONRY_MIN_COL_WIDTH = 320;

export default function AppPage() {
  const { images, setImages } = useImages();
  const loading = useExtractMetadata();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [masonryRef, masonrySize] = useContainerSize<HTMLDivElement>();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [addByUrlOpen, setAddByUrlOpen] = useState(false);

  const masonryCols =
    masonrySize != null
      ? Math.max(1, Math.floor(masonrySize.width / MASONRY_MIN_COL_WIDTH))
      : 3;

  const results = images?.results ?? [];
  const hasResults = results.length > 0;

  const handleUploadMore = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const newResults: ResultItem[] = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      metadata: null,
      error: null,
    }));
    setImages((prev) => {
      if (!prev) {
        return {
          results: newResults,
          onClear: () => setImages(null),
          onAddMore: () => {},
        };
      }
      return { ...prev, results: [...prev.results, ...newResults] };
    });
    e.target.value = "";
  };

  const handleClearAll = () => {
    setImages(null);
  };

  const handleRemoveSingle = (item: ResultItem) => {
    const key = item.file.name + item.file.size;
    setImages((prev) => {
      if (!prev) return null;
      const next = prev.results.filter(
        (r) => r.file.name + r.file.size !== key
      );
      if (next.length === 0) return null;
      return { ...prev, results: next };
    });
  };

  const handleAddByUrl = (item: ResultItem) => {
    setImages((prev) => {
      if (prev) {
        return { ...prev, results: [...prev.results, item] };
      }
      return {
        results: [item],
        onClear: () => setImages(null),
        onAddMore: () => {},
      };
    });
  };

  const { sidebarOpen, setSidebarOpen, isMobile } = useAppLayout();

  if (!hasResults) {
    return (
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="glass sticky top-0 z-20 flex shrink-0 items-center gap-2 border-b border-glass-border px-4 py-3 sm:px-6">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="size-5" />
              ) : (
                <PanelLeft className="size-5" />
              )}
            </Button>
          )}
          <span className="font-syne text-sm font-semibold text-foreground sm:text-base">
            Metadata Extractor
          </span>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-xl">
            <h2 className="mb-6 text-center font-syne text-2xl font-semibold text-foreground">
              Drop images to get started
            </h2>
            <ImageUploadZone noNavigate />
            <p className="mt-4 text-center">
              <Button
                type="button"
                variant="link"
                size="sm"
                className="inline-flex h-auto items-center gap-1.5 p-0 text-sm font-medium"
                onClick={() => setAddByUrlOpen(true)}
                aria-label="Add image by URL"
              >
                <Link2 className="size-4" aria-hidden />
                Or add by URL
              </Button>
            </p>
          </div>
          <AddByUrlDialog
            open={addByUrlOpen}
            onOpenChange={setAddByUrlOpen}
            onAdd={handleAddByUrl}
          />
        </div>
      </div>
    );
  }

  const promptCount = results.reduce((acc, r) => {
    const p = r.metadata?.prompt;
    if (!p) return acc;
    return acc + (p.positive ? 1 : 0) + (p.negative ? 1 : 0);
  }, 0);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      <header className="glass sticky top-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-glass-border px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="size-9 shrink-0"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="size-5" />
              ) : (
                <PanelLeft className="size-5" />
              )}
            </Button>
          )}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-10">
              <ImageIcon className="size-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-syne text-base font-semibold text-foreground sm:text-lg">
                {results.length} image{results.length !== 1 ? "s" : ""}
              </h1>
              <p className="truncate text-xs text-muted-foreground sm:text-sm">
                {promptCount} prompt{promptCount !== 1 ? "s" : ""} extracted
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="glass flex rounded-lg border border-glass-border p-0.5"
            role="group"
            aria-label="View mode"
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-8", viewMode === "list" && "bg-muted")}
              onClick={() => setViewMode("list")}
              aria-label="List view"
            >
              <List className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-8", viewMode === "grid-detail" && "bg-muted")}
              onClick={() => setViewMode("grid-detail")}
              aria-label="Grid with details below"
            >
              <PanelTop className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("size-8", viewMode === "masonry" && "bg-muted")}
              onClick={() => setViewMode("masonry")}
              aria-label="Masonry view"
            >
              <Layers className="size-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddByUrlOpen(true)}
            className="shrink-0"
            aria-label="Add image by URL"
          >
            <Link2 className="size-4 sm:mr-1.5" aria-hidden />
            <span className="hidden sm:inline">Add by URL</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadMore}
            className="shrink-0"
            aria-label="Upload more images"
          >
            <Plus className="size-4 sm:mr-1.5" aria-hidden />
            <span className="hidden sm:inline">Upload more</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            aria-label="Clear all images"
          >
            <Trash2 className="size-4 sm:mr-1.5" aria-hidden />
            <span className="hidden sm:inline">Clear all</span>
          </Button>
        </div>
      </header>
      <AddByUrlDialog
        open={addByUrlOpen}
        onOpenChange={setAddByUrlOpen}
        onAdd={handleAddByUrl}
      />
      <ScrollArea className="flex-1">
        {viewMode === "masonry" ? (
          <div ref={masonryRef} className="p-6">
            <Masonry
              breakpointCols={masonryCols}
              className="masonry-grid"
              columnClassName="masonry-grid_column"
            >
              {results.map((r) => (
                <div
                  key={r.file.name + r.file.size}
                  className="content-visibility-auto"
                >
                  <ImageCard
                    item={r}
                    loading={loading}
                    onRemove={handleRemoveSingle}
                    layout="vertical"
                  />
                </div>
              ))}
            </Masonry>
          </div>
        ) : (
          <div
            className={cn(
              "gap-3 p-6",
              viewMode === "list"
                ? "flex flex-col"
                : "grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))]"
            )}
          >
            {results.map((r) => (
              <div
                key={r.file.name + r.file.size}
                className="content-visibility-auto"
              >
                <ImageCard
                  item={r}
                  loading={loading}
                  onRemove={handleRemoveSingle}
                  layout={
                    viewMode === "grid-detail" ? "vertical" : "horizontal"
                  }
                  fixedImageHeight={viewMode === "grid-detail"}
                />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
