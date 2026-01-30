# ComfyUI Metadata Preview

Free tool to extract prompts, workflow, and metadata from ComfyUI and Civitai PNG images. Everything runs in your browser — nothing is uploaded or sent to a server. View positive and negative prompts, models, dimensions, and export to JSON, text, or CSV. No signup required.

## Features

- **Client-side only** — Extraction runs in your browser. No uploads, no server. Files stay on your device.
- **Prompt extraction** — Read positive/negative prompts from embedded ComfyUI workflow (including linked nodes like PromptEnhancer) and Civitai-style parameters
- **Workflow** — Inspect workflow JSON and node graph stored in the image
- **Bulk & export** — Process many images at once in the browser; export prompts as JSON, text, or CSV, or workflow as JSON
- **Views** — List, grid (fixed-height cards), or masonry
- **Add by URL** — Load images from a URL in addition to drag-and-drop

## Tech

- Next.js 16, React 19, TypeScript
- Tailwind v4, shadcn/ui, Lucide icons
- Fonts: Syne, DM Sans
- `png-chunks-extract` / `png-chunk-text` for PNG metadata; `react-dropzone`, `react-masonry-css`

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Drop PNGs on the landing page or open `/app` to add by URL or add more files. All processing happens in your browser.

```bash
npm run build
npm start
```

## Project structure

- `app/` — Routes: landing (`page.tsx`), app UI (`app/`), API (`api/extract-metadata`)
- `components/` — Landing (upload zone, theme toggle), app (sidebar, add-by-URL dialog), `ui/` (shadcn)
- `contexts/` — Images state, app layout (sidebar/mobile)
- `lib/` — Metadata extraction (ComfyUI + Civitai parameters), export, API client
- `hooks/` — Container size (masonry), mobile detection
- `types/` — Shared types

## License

Private.
