import 'server-only';
import { NextResponse } from 'next/server';

/**
 * Controller for POST /api/toonify.
 *
 * Server-side proxy that fetches an arbitrary `imageUrl` and returns it as a
 * base64 `data:` URL so the client can run background-removal without CORS
 * blocking. Moved verbatim from `app/api/toonify/route.ts`.
 */
export const toonifyController = {
  async handle(req: Request): Promise<Response> {
    try {
      const { imageUrl } = await req.json();

      if (!imageUrl) {
        return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
      }

      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch image' }, { status: 400 });
      }

      const imageBuffer = await imageResponse.arrayBuffer();
      const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
      const base64 = Buffer.from(imageBuffer).toString('base64');

      return NextResponse.json({ imageData: `data:${contentType};base64,${base64}` });
    } catch (error) {
      console.error('Proxy Error:', error);
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
  },
};
