import { NextResponse } from "next/server";
import { removeBackground } from "@imgly/background-removal-node";

export const maxDuration = 60;

// Simple in-memory cache: imageUrl -> base64 PNG with transparent background
const bgRemovedCache = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    // Return cached result if available
    if (bgRemovedCache.has(imageUrl)) {
      return NextResponse.json({ imageData: bgRemovedCache.get(imageUrl) });
    }

    // 1. Fetch the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
    }

    const imageBlob = await imageResponse.blob();

    // 2. Remove background server-side
    // Passing the Blob directly instead of a data URL to avoid "Unsupported protocol: data:" error
    const resultBlob = await removeBackground(imageBlob);

    // 3. Convert result Blob to base64 data URL
    const resultBuffer = Buffer.from(await resultBlob.arrayBuffer());
    const resultDataUrl = `data:image/png;base64,${resultBuffer.toString("base64")}`;

    // 4. Cache the result
    bgRemovedCache.set(imageUrl, resultDataUrl);

    return NextResponse.json({ imageData: resultDataUrl });
  } catch (error) {
    console.error("Background removal error:", error);
    return NextResponse.json({ error: "Failed to remove background" }, { status: 500 });
  }
}
