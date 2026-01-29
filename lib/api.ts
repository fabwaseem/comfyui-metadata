import type { Metadata } from "@/types";

export type ExtractResult =
  | { metadata: Metadata; error: null }
  | { metadata: null; error: string };

export async function extractMetadata(file: File): Promise<ExtractResult> {
  const form = new FormData();
  form.set("file", file);
  const res = await fetch("/api/extract-metadata", {
    method: "POST",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) {
    return {
      metadata: null,
      error: (data as { error?: string }).error ?? "Failed to extract",
    };
  }
  return { metadata: data as Metadata, error: null };
}
