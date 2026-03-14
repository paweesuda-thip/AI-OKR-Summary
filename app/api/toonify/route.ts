import { NextResponse } from "next/server";
import { removeBackground } from "@imgly/background-removal-node";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    console.log("Removing background locally for top performer:", imageUrl);

    try {
      // Use local @imgly/background-removal-node
      // This runs completely locally and is 100% free and unlimited
      const blob = await removeBackground(imageUrl);
      
      const buffer = await blob.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      
      console.log("Successfully removed background locally!");
      return NextResponse.json({ 
        success: true, 
        toonifiedUrl: `data:image/png;base64,${base64}` 
      });
    } catch (err) {
      console.error("Error during local background removal:", err);
    }
    
    // Fallback: Return original image if local removal fails
    return NextResponse.json({ 
      success: true, 
      toonifiedUrl: imageUrl 
    });

  } catch (error) {
    console.error("Toonify Error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
