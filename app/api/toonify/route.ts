import { NextResponse } from "next/server";
import { removeBackground } from "@imgly/background-removal-node";

// In-memory cache (persists across requests within the same server process)
const imageCache = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    // 1. CHECK SERVER CACHE FIRST
    if (imageCache.has(imageUrl)) {
      console.log("⚡ Serving from server cache");
      return NextResponse.json({ success: true, toonifiedUrl: imageCache.get(imageUrl) });
    }

    console.log("Removing background (server-side):", imageUrl);

    // 2. Fetch image server-side (no CORS issue)
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ success: true, toonifiedUrl: imageUrl });
    }
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const imageBlob = new Blob([imageBuffer], { type: contentType });

    // 3. Remove background with @imgly/background-removal-node (free, local)
    const resultBlob = await removeBackground(imageBlob);
    const resultBuffer = await resultBlob.arrayBuffer();
    const base64 = Buffer.from(resultBuffer).toString("base64");
    const finalUrl = `data:image/png;base64,${base64}`;

    imageCache.set(imageUrl, finalUrl);
    console.log("✅ Background removed and cached");

    return NextResponse.json({ success: true, toonifiedUrl: finalUrl });

  } catch (error) {
    console.error("Toonify Error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
