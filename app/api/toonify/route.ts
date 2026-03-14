import { NextResponse } from "next/server";

// Proxy image server-side to bypass CORS — background removal happens client-side
export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch image" }, { status: 400 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get("content-type") || "image/jpeg";
    const base64 = Buffer.from(imageBuffer).toString("base64");

    return NextResponse.json({ imageData: `data:${contentType};base64,${base64}` });

  } catch (error) {
    console.error("Proxy Error:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
