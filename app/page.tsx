"use client";

import { ImageUploadZone } from "@/components/landing/image-upload-zone";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { Button } from "@/components/ui/button";
import { FileSearch, Layers, Zap, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.7_0.08_260/.15),transparent)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_100%_0%,oklch(0.6_0.06_280/.08),transparent)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_0%_100%,oklch(0.55_0.07_300/.06),transparent)]" />

      <header className="glass border-b border-glass-border" role="banner">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold"
            aria-label="ComfyUI Metadata Preview — Home"
          >
            <span className="font-syne text-lg">ComfyUI Metadata</span>
          </Link>
          <nav className="flex items-center gap-3" aria-label="Primary">
            <ThemeToggle />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app">Open app</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24"
        tabIndex={-1}
      >
        <section className="text-center">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary backdrop-blur-sm">
            <Sparkles className="size-4" aria-hidden />
            Free · No signup · No upload
          </p>
          <h1 className="font-syne text-4xl font-bold tracking-tight text-foreground text-balance sm:text-5xl md:text-6xl">
            Extract prompts & workflow
            <br />
            <span className="text-primary">from ComfyUI PNGs</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Drop images to view prompts and workflow. Everything runs in your
            browser — nothing is uploaded or sent to a server.
          </p>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-center font-syne text-2xl font-semibold text-foreground sm:text-3xl">
            Drop images to get started
          </h2>
          <ImageUploadZone />
        </section>

        <section className="mt-20 grid gap-8 sm:grid-cols-3">
          <div className="glass-card flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <FileSearch className="size-6" aria-hidden />
            </div>
            <h3 className="font-syne font-semibold text-foreground">
              Prompt extraction
            </h3>
            <p className="text-sm text-muted-foreground">
              Read positive and negative prompts from embedded metadata.
              Processed locally in your browser.
            </p>
          </div>
          <div className="glass-card flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Layers className="size-6" aria-hidden />
            </div>
            <h3 className="font-syne font-semibold text-foreground">
              Workflow view
            </h3>
            <p className="text-sm text-muted-foreground">
              Inspect node graph and parameters stored in the image. No data
              leaves your device.
            </p>
          </div>
          <div className="glass-card flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Zap className="size-6" aria-hidden />
            </div>
            <h3 className="font-syne font-semibold text-foreground">
              Bulk & export
            </h3>
            <p className="text-sm text-muted-foreground">
              Process many images at once in your browser. Export prompts or
              workflow JSON. No uploads.
            </p>
          </div>
        </section>

        <footer className="mt-24 border-t border-glass-border py-8 text-center text-sm text-muted-foreground">
          <p>
            ComfyUI Metadata · Extract prompts in your browser. No upload, no
            signup.
          </p>
          <p className="mt-2">
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
        </footer>
      </main>
    </div>
  );
}
