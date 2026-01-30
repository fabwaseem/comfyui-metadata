import extractChunks from "png-chunks-extract";
import { decode } from "png-chunk-text";
import type { ExtractedPrompt, Metadata } from "@/types";

export function extractMetadata(buffer: ArrayBuffer): Metadata {
  const data = new Uint8Array(buffer);
  const chunks = extractChunks(data);
  const raw: Record<string, string> = {};
  let promptRaw: Record<string, unknown> | null = null;
  let workflow: Record<string, unknown> | null = null;
  let parameters: string | null = null;
  let width: number | undefined;
  let height: number | undefined;

  for (const chunk of chunks) {
    if (chunk.name === "IHDR" && chunk.data.length >= 8) {
      const view = new DataView(
        chunk.data.buffer,
        chunk.data.byteOffset,
        chunk.data.byteLength
      );
      width = view.getUint32(0, false);
      height = view.getUint32(4, false);
      continue;
    }
    if (chunk.name !== "tEXt") continue;
    const { keyword, text } = decode(chunk.data);
    raw[keyword] = text;
    if (keyword === "prompt") {
      try {
        promptRaw = JSON.parse(text) as Record<string, unknown>;
      } catch {
        raw[keyword] = text;
      }
    } else if (keyword === "workflow") {
      try {
        workflow = JSON.parse(text) as Record<string, unknown>;
      } catch {
        raw[keyword] = text;
      }
    } else if (keyword === "parameters") {
      parameters = text;
    }
  }

  let prompt: ExtractedPrompt | null = null;
  let models: string[] = [];
  if (promptRaw) {
    const texts = extractPromptTextsFromRaw(promptRaw);
    if (texts.length >= 2) {
      prompt = { positive: texts[0], negative: texts[1] };
    } else if (texts.length === 1) {
      prompt = { positive: texts[0] };
    }
    models = extractModelsFromRaw(promptRaw);
  }

  if (!prompt && parameters) {
    const civitai = parseCivitaiParameters(parameters);
    if (civitai) {
      prompt = {
        positive: civitai.positive,
        ...(civitai.negative != null && civitai.negative.length > 0
          ? { negative: civitai.negative }
          : {}),
      };
      models = civitai.models;
      if (civitai.width != null && civitai.height != null) {
        width = civitai.width;
        height = civitai.height;
      }
    }
  }

  const result: Metadata = {
    prompt,
    workflow,
    parameters,
    raw,
    models,
  };
  if (width != null) result.width = width;
  if (height != null) result.height = height;
  return result;
}

type CivitaiParseResult = {
  positive: string;
  negative?: string;
  models: string[];
  width?: number;
  height?: number;
};

function parseCivitaiParameters(parameters: string): CivitaiParseResult | null {
  const trimmed = parameters.trim();
  if (!trimmed.length) return null;

  const models: string[] = [];
  const seen = new Set<string>();
  const addModel = (name: string) => {
    const n = name.trim();
    if (n && !seen.has(n)) {
      seen.add(n);
      models.push(n);
    }
  };

  let positive: string;
  let negative: string | undefined;
  let tail = trimmed;

  const quotedMatch = trimmed.match(/^"((?:[^"\\]|\\.)*)"/);
  if (quotedMatch) {
    positive = quotedMatch[1].replace(/\\(.)/g, "$1");
    tail = trimmed.slice(quotedMatch[0].length);
  } else {
    const negLabel = "\nNegative prompt:";
    const negIdx = trimmed.indexOf(negLabel);
    const stepsIdx = trimmed.search(/\nSteps:\s*\d+/i);
    const modelIdx = trimmed.search(/\nModel:\s*/i);

    if (negIdx >= 0) {
      positive = trimmed.slice(0, negIdx).trim();
      const afterNeg = trimmed.slice(negIdx + negLabel.length);
      const stepsMatch = afterNeg.match(/\nSteps:\s*\d+/i);
      negative = stepsMatch
        ? afterNeg.slice(0, stepsMatch.index).trim()
        : afterNeg.trim();
      negative = negative.length ? negative : undefined;
      tail =
        stepsMatch && stepsMatch.index != null
          ? afterNeg.slice(stepsMatch.index)
          : modelIdx >= 0
          ? trimmed.slice(modelIdx)
          : "";
    } else {
      const metaStart = trimmed.search(/\nSteps:\s*\d+|\nModel:\s*/i);
      if (metaStart >= 0) {
        positive = trimmed.slice(0, metaStart).trim();
        tail = trimmed.slice(metaStart);
      } else {
        positive = trimmed;
        tail = "";
      }
    }
  }

  if (!positive.length) return null;

  const loraTagRegex = /<lora:([^>:]+)(?::[^>]+)?>/gi;
  let m: RegExpExecArray | null;
  while ((m = loraTagRegex.exec(tail)) !== null) addModel(m[1]);

  const modelMatch = tail.match(
    /Model:\s*([^,]+?)(?:\s*,\s*Model hash:|\s*,\s*VAE:|\s*,\s*Clip skip:|$)/i
  );
  if (modelMatch) addModel(modelMatch[1].trim());

  const vaeMatch = tail.match(
    /VAE:\s*([^,]+?)(?:\s*,\s*VAE hash:|\s*,\s*Hashes:|\s*$)/i
  );
  if (vaeMatch) addModel(vaeMatch[1].trim());

  const loraHashesMatch = tail.match(/Lora hashes:\s*"([^"]+)"/i);
  if (loraHashesMatch) {
    const pairs = loraHashesMatch[1].split(",").map((s) => s.trim());
    for (const p of pairs) {
      const colon = p.indexOf(":");
      if (colon > 0) addModel(p.slice(0, colon).trim());
    }
  }

  let width: number | undefined;
  let height: number | undefined;
  const sizeMatch = tail.match(/Size:\s*(\d+)\s*[x×]\s*(\d+)/i);
  if (sizeMatch) {
    width = parseInt(sizeMatch[1], 10);
    height = parseInt(sizeMatch[2], 10);
  }

  const out: CivitaiParseResult = { positive, models };
  if (
    negative != null &&
    negative.length > 0 &&
    negative.trim() !== positive.trim()
  ) {
    out.negative = negative;
  }
  if (width != null && height != null) {
    out.width = width;
    out.height = height;
  }
  return out;
}

const MODEL_INPUT_KEYS = [
  "ckpt_name",
  "lora_name",
  "unet_name",
  "clip_name",
  "vae_name",
  "model_name",
  "clip_name1",
  "clip_name2",
];

function extractModelsFromRaw(promptRaw: Record<string, unknown>): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  const prompt = promptRaw as Record<string, PromptNode>;

  for (const node of Object.values(prompt)) {
    if (!node?.inputs) continue;
    const inputs = node.inputs as Record<string, unknown>;
    for (const key of MODEL_INPUT_KEYS) {
      const val = inputs[key];
      if (typeof val === "string" && val.trim() !== "") {
        const name = val.trim();
        if (!seen.has(name)) {
          seen.add(name);
          order.push(name);
        }
      }
    }
  }

  return order;
}

type PromptNode = {
  inputs?: Record<string, unknown>;
  class_type?: string;
};

const PROMPT_INPUT_KEYS = ["prompt_text", "text", "value", "string", "prompt"];

function getNodeStringValue(
  prompt: Record<string, unknown>,
  nodeId: string
): string | null {
  const node = prompt[nodeId] as PromptNode | undefined;
  if (!node?.inputs) return null;
  const inputs = node.inputs as Record<string, unknown>;
  for (const key of PROMPT_INPUT_KEYS) {
    const val = inputs[key];
    if (typeof val === "string" && val.trim() !== "") {
      return val.trim();
    }
  }
  if (
    Array.isArray(inputs.text) &&
    inputs.text.length >= 1 &&
    typeof inputs.text[0] === "string"
  ) {
    return getNodeStringValue(prompt, inputs.text[0] as string);
  }
  return null;
}

function extractPromptTextsFromRaw(
  promptRaw: Record<string, unknown>
): string[] {
  const seen = new Set<string>();
  const order: string[] = [];
  const prompt = promptRaw as Record<string, PromptNode>;

  for (const [nodeId, node] of Object.entries(prompt)) {
    if (!node?.inputs) continue;
    const inputs = node.inputs as Record<string, unknown>;
    const classType = node.class_type;

    if (
      classType === "PrimitiveStringMultiline" &&
      typeof inputs.value === "string" &&
      inputs.value.trim() !== ""
    ) {
      const value = inputs.value.trim();
      if (!seen.has(value)) {
        seen.add(value);
        order.push(value);
      }
      continue;
    }

    if (classType === "CLIPTextEncode") {
      let text: string | null = null;
      if (typeof inputs.text === "string") {
        text = inputs.text.trim() || null;
      } else if (
        Array.isArray(inputs.text) &&
        inputs.text.length >= 1 &&
        typeof inputs.text[0] === "string"
      ) {
        text = getNodeStringValue(prompt, inputs.text[0] as string);
      }
      if (text && !seen.has(text)) {
        seen.add(text);
        order.push(text);
      }
    }
  }

  return order;
}

export function getPromptTexts(metadata: Metadata): string[] {
  if (!metadata.prompt) return [];
  const p = metadata.prompt as ExtractedPrompt & Record<string, unknown>;
  if (typeof p.positive === "string") {
    return [p.positive, p.negative].filter(
      (s): s is string => typeof s === "string" && s.length > 0
    );
  }
  return extractPromptTextsFromRaw(metadata.prompt as Record<string, unknown>);
}
