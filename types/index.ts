export type ExtractedPrompt = {
  positive: string;
  negative?: string;
};

export type Metadata = {
  prompt: ExtractedPrompt | null;
  workflow: Record<string, unknown> | null;
  parameters: string | null;
  raw: Record<string, string>;
  models: string[];
  width?: number;
  height?: number;
};

export type ResultItem = {
  file: File;
  preview: string;
  metadata: Metadata | null;
  error: string | null;
};
