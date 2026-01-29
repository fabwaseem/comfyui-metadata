import type { ResultItem } from "@/types";

export type ExportFormat =
  | "workflow-json"
  | "prompts-json"
  | "prompts-txt"
  | "prompts-csv";

export type PromptsIncludeOptions = {
  includeNumber: boolean;
  includeFilename: boolean;
  includePrompt: boolean;
  includeNegativePrompt: boolean;
};

const defaultPromptsInclude: PromptsIncludeOptions = {
  includeNumber: true,
  includeFilename: true,
  includePrompt: true,
  includeNegativePrompt: true,
};

export function buildWorkflowJson(results: ResultItem[]): string {
  const workflows = results
    .map((r) => r.metadata?.workflow ?? null)
    .filter((w): w is Record<string, unknown> => w != null);
  if (workflows.length === 0) return "null";
  if (workflows.length === 1) return JSON.stringify(workflows[0], null, 2);
  return JSON.stringify(workflows, null, 2);
}

function getPromptRow(r: ResultItem): {
  positive: string;
  negative: string;
} {
  if (!r.metadata?.prompt) {
    return { positive: r.error ?? "No metadata found", negative: "" };
  }
  const p = r.metadata.prompt;
  return {
    positive: p.positive ?? "",
    negative: p.negative ?? "",
  };
}

export function buildPromptsTxt(
  results: ResultItem[],
  options: PromptsIncludeOptions = defaultPromptsInclude
): string {
  const lines: string[] = [];
  results.forEach((r, i) => {
    const { positive, negative } = getPromptRow(r);
    const parts: string[] = [];
    if (options.includeNumber) parts.push(`${i + 1}`);
    if (options.includeFilename) parts.push(r.file.name);
    if (options.includePrompt) parts.push(positive);
    if (options.includeNegativePrompt) parts.push(negative);
    lines.push(parts.join(" | "));
  });
  return lines.join("\n");
}

export function buildPromptsJson(
  results: ResultItem[],
  options: PromptsIncludeOptions = defaultPromptsInclude
): string {
  const data = results.map((r, i) => {
    const { positive, negative } = getPromptRow(r);
    const item: Record<string, unknown> = {};
    if (options.includeNumber) item.number = i + 1;
    if (options.includeFilename) item.filename = r.file.name;
    if (options.includePrompt) item.prompt = positive;
    if (options.includeNegativePrompt) item.negativePrompt = negative;
    return item;
  });
  return JSON.stringify(data, null, 2);
}

export function buildPromptsCsv(
  results: ResultItem[],
  options: PromptsIncludeOptions = defaultPromptsInclude
): string {
  const headers: string[] = [];
  if (options.includeNumber) headers.push("number");
  if (options.includeFilename) headers.push("filename");
  if (options.includePrompt) headers.push("prompt");
  if (options.includeNegativePrompt) headers.push("negative_prompt");
  const headerLine = headers.join(",") + "\n";

  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const rows = results.map((r, i) => {
    const { positive, negative } = getPromptRow(r);
    const cells: string[] = [];
    if (options.includeNumber) cells.push(String(i + 1));
    if (options.includeFilename) cells.push(escape(r.file.name));
    if (options.includePrompt) cells.push(escape(positive));
    if (options.includeNegativePrompt) cells.push(escape(negative));
    return cells.join(",") + "\n";
  });
  return headerLine + rows.join("");
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export type ExportOptions = {
  promptsInclude?: PromptsIncludeOptions;
};

export function exportResults(
  results: ResultItem[],
  format: ExportFormat,
  options: ExportOptions = {}
): void {
  const promptsInclude = options.promptsInclude ?? defaultPromptsInclude;
  let content: string;
  let filename: string;
  let mime: string;
  switch (format) {
    case "workflow-json":
      content = buildWorkflowJson(results);
      filename = "comfyui-workflow.json";
      mime = "application/json";
      break;
    case "prompts-txt":
      content = buildPromptsTxt(results, promptsInclude);
      filename = "comfyui-prompts.txt";
      mime = "text/plain;charset=utf-8";
      break;
    case "prompts-json":
      content = buildPromptsJson(results, promptsInclude);
      filename = "comfyui-prompts.json";
      mime = "application/json";
      break;
    case "prompts-csv":
      content = buildPromptsCsv(results, promptsInclude);
      filename = "comfyui-prompts.csv";
      mime = "text/csv;charset=utf-8";
      break;
    default:
      return;
  }
  const blob = new Blob([content], { type: mime });
  downloadBlob(blob, filename);
}

export function copyPromptsToClipboard(
  results: ResultItem[],
  options: PromptsIncludeOptions = defaultPromptsInclude
): Promise<void> {
  const text = buildPromptsTxt(results, options);
  return navigator.clipboard.writeText(text);
}
