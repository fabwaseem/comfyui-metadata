import type { Metadata } from "next";
import { AppLayoutClient } from "./app-layout-client";

export const metadata: Metadata = {
  title: "Metadata Extractor",
  description:
    "Extract and view prompts, workflow, and models from ComfyUI and Civitai images. Export to JSON, text, or CSV.",
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://comfyui-metadata.vercel.app/app",
  },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutClient>{children}</AppLayoutClient>;
}
