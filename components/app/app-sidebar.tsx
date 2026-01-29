"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, PanelLeftClose } from "lucide-react";
import { useImages } from "@/contexts/images-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  exportResults,
  type ExportFormat,
  type PromptsIncludeOptions,
} from "@/lib/export";

type ExportType = "workflow" | "prompts";

const PROMPTS_FORMATS: { value: ExportFormat; label: string }[] = [
  { value: "prompts-json", label: "JSON" },
  { value: "prompts-txt", label: "Text" },
  { value: "prompts-csv", label: "CSV" },
];

type AppSidebarProps = {
  onClose?: () => void;
};

export function AppSidebar({ onClose }: AppSidebarProps) {
  const { images } = useImages();
  const [exportType, setExportType] = useState<ExportType>("prompts");
  const [format, setFormat] = useState<ExportFormat>("prompts-json");
  const [promptsInclude, setPromptsInclude] = useState<PromptsIncludeOptions>({
    includeNumber: true,
    includeFilename: true,
    includePrompt: true,
    includeNegativePrompt: true,
  });

  const results = images?.results ?? [];
  const hasResults = results.length > 0;

  const handleExportTypeChange = (value: ExportType) => {
    setExportType(value);
    if (value === "prompts") setFormat("prompts-json");
  };

  const handleExport = () => {
    if (!hasResults) return;
    if (exportType === "workflow") {
      exportResults(results, "workflow-json");
    } else {
      exportResults(results, format, { promptsInclude });
    }
  };

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-glass-border px-2">
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 shrink-0"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="size-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="flex-1 justify-start"
          asChild
        >
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4 p-4">
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Export
            </Label>
            <Select
              value={exportType}
              onValueChange={(v) => handleExportTypeChange(v as ExportType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="workflow">Workflow (JSON)</SelectItem>
                <SelectItem value="prompts">Prompts</SelectItem>
              </SelectContent>
            </Select>

            {exportType === "prompts" && (
              <>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v as ExportFormat)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROMPTS_FORMATS.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-2 pt-1">
                  <Label className="text-xs text-muted-foreground">
                    Include columns
                  </Label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={promptsInclude.includeNumber}
                        onCheckedChange={(c) =>
                          setPromptsInclude((p) => ({
                            ...p,
                            includeNumber: !!c,
                          }))
                        }
                      />
                      Number
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={promptsInclude.includeFilename}
                        onCheckedChange={(c) =>
                          setPromptsInclude((p) => ({
                            ...p,
                            includeFilename: !!c,
                          }))
                        }
                      />
                      Filename
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={promptsInclude.includePrompt}
                        onCheckedChange={(c) =>
                          setPromptsInclude((p) => ({
                            ...p,
                            includePrompt: !!c,
                          }))
                        }
                      />
                      Prompt
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={promptsInclude.includeNegativePrompt}
                        onCheckedChange={(c) =>
                          setPromptsInclude((p) => ({
                            ...p,
                            includeNegativePrompt: !!c,
                          }))
                        }
                      />
                      Negative prompt
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
      <div className="shrink-0 space-y-3 border-t border-glass-border p-4">
        <Button
          className="w-full"
          size="sm"
          disabled={!hasResults}
          onClick={handleExport}
          aria-label="Export workflow or prompts"
        >
          <Download className="size-4" aria-hidden />
          Export
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          <a
            href="https://waseemanjum.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            waseemanjum.com
          </a>
          {" · "}
          <a
            href="https://github.com/fabwaseem"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            @fabwaseem
          </a>
        </p>
      </div>
    </>
  );
}
