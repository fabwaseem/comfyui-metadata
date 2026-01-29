import { NextResponse } from "next/server";
import { extractMetadata } from "@/lib/extract-metadata";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (
      !file.type.startsWith("image/") &&
      !file.name.toLowerCase().endsWith(".png")
    ) {
      return NextResponse.json(
        { error: "File must be a PNG image" },
        { status: 400 }
      );
    }
    const buffer = await file.arrayBuffer();
    const metadata = extractMetadata(buffer);
    return NextResponse.json(metadata);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to extract metadata";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
