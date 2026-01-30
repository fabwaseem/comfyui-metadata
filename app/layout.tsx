import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const BASE_URL = "https://comfyui-metadata.vercel.app";
const siteName = "ComfyUI Metadata Preview";
const defaultTitle =
  "ComfyUI Metadata Preview — Extract prompts & workflow from ComfyUI PNGs";
const defaultDescription =
  "Free tool to extract prompts, workflow, and metadata from ComfyUI and Civitai PNG images in your browser. Nothing is uploaded. View positive and negative prompts, models, and export to JSON, text, or CSV. No signup required.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: defaultTitle,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  keywords: [
    "ComfyUI",
    "ComfyUI metadata",
    "ComfyUI prompt extractor",
    "Civitai metadata",
    "workflow extractor",
    "PNG metadata",
    "AI image prompts",
    "Stable Diffusion prompts",
  ],
  authors: [{ name: siteName, url: BASE_URL }],
  creator: siteName,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName,
    title: defaultTitle,
    description: defaultDescription,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
  }),
  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: siteName,
    url: BASE_URL,
    description: defaultDescription,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Client-side extraction — nothing uploaded or sent to a server",
      "Extract prompts from ComfyUI and Civitai PNG images",
      "View workflow metadata and models",
      "Export to JSON, text, or CSV",
      "Bulk processing in your browser",
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${syne.variable} ${dmSans.variable}`}
    >
      <body className="antialiased relative z-10">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
