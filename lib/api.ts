import { extractMetadata as extractFromBuffer } from "@/lib/extract-metadata";
import type { Metadata } from "@/types";

export type ExtractResult =
  | { metadata: Metadata; error: null }
  | { metadata: null; error: string };

export async function extractMetadata(file: File): Promise<ExtractResult> {
  try {
    const buffer = await file.arrayBuffer();
    const metadata = extractFromBuffer(buffer);
    return { metadata, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to extract metadata";
    return { metadata: null, error: message };
  }
}
