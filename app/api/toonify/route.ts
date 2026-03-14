import { NextResponse } from "next/server";

// In-memory cache to store processed images
// This saves API quotas and makes subsequent loads instant (0.001s)
const imageCache = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    // 1. CHECK CACHE FIRST
    if (imageCache.has(imageUrl)) {
      console.log("⚡ Serving background-removed image from Cache!");
      return NextResponse.json({ 
        success: true, 
        toonifiedUrl: imageCache.get(imageUrl) 
      });
    }

    console.log("Removing background for top performer:", imageUrl);

    // 2. CLIPDROP API (Fastest, 100 free/month)
    const clipdropKey = process.env.CLIPDROP_API_KEY;
    if (clipdropKey) {
      try {
        console.log("Calling Clipdrop API...");
        const imageResponse = await fetch(imageUrl);
        const imageBlob = await imageResponse.blob();
        
        const formData = new FormData();
        formData.append('image_file', imageBlob);
        
        const response = await fetch('https://clipdrop-api.co/remove-background/v1', {
          method: 'POST',
          headers: { 'x-api-key': clipdropKey },
          body: formData,
        });

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const finalUrl = `data:image/png;base64,${base64}`;
          
          imageCache.set(imageUrl, finalUrl); // Save to cache
          console.log("✅ Successfully removed background with Clipdrop and Cached!");
          
          return NextResponse.json({ success: true, toonifiedUrl: finalUrl });
        } else {
           console.error("Clipdrop error:", await response.text());
        }
      } catch (err) {
        console.error("Clipdrop error:", err);
      }
    }

    // 3. REMOVE.BG API (Fallback, 50 free/month)
    const removeBgKey = process.env.REMOVE_BG_API_KEY;
    if (removeBgKey) {
      try {
        console.log("Calling Remove.bg API...");
        const formData = new FormData();
        formData.append('image_url', imageUrl);
        formData.append('size', 'auto');
        
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: { 'X-Api-Key': removeBgKey },
          body: formData,
        });

        if (response.ok) {
          const buffer = await response.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const finalUrl = `data:image/png;base64,${base64}`;
          
          imageCache.set(imageUrl, finalUrl); // Save to cache
          console.log("✅ Successfully removed background with Remove.bg and Cached!");
          
          return NextResponse.json({ success: true, toonifiedUrl: finalUrl });
        } else {
           console.error("Remove.bg error status:", response.status);
        }
      } catch (err) {
        console.error("Remove.bg error:", err);
      }
    }
    
    // Fallback: Return original image if all APIs fail or no keys
    return NextResponse.json({ 
      success: true, 
      toonifiedUrl: imageUrl 
    });

  } catch (error) {
    console.error("Toonify Error:", error);
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }
}
