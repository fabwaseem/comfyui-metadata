"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ResultItem } from "@/types";

async function fetchImageAsResultItem(url: string): Promise<ResultItem> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) {
    throw new Error(`Failed to load image: ${res.status}`);
  }
  const blob = await res.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("URL does not point to an image");
  }
  const name =
    url.split("/").pop()?.replace(/\?.*$/, "") ||
    `image.${blob.type.split("/")[1] || "png"}`;
  const file = new File([blob], name, { type: blob.type });
  const preview = URL.createObjectURL(file);
  return {
    file,
    preview,
    metadata: null,
    error: null,
  };
}

type AddByUrlDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: ResultItem) => void;
};

export function AddByUrlDialog({
  open,
  onOpenChange,
  onAdd,
}: AddByUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    setLoading(true);
    try {
      const item = await fetchImageAsResultItem(trimmed);
      onAdd(item);
      setUrl("");
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load image from URL"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setUrl("");
      setError(null);
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add image by URL</DialogTitle>
          <DialogDescription>
            Enter an image URL to load the image. Metadata is extracted in your
            browser — nothing is uploaded.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">Image URL</Label>
            <Input
              id="image-url"
              name="image-url"
              type="url"
              autoComplete="url"
              placeholder="https://example.com/image.png …"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              aria-invalid={!!error}
              aria-describedby={error ? "image-url-error" : undefined}
            />
            {error && (
              <p id="image-url-error" className="text-sm text-destructive" role="alert" aria-live="polite">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !url.trim()}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading…
                </span>
              ) : (
                "Add image"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
