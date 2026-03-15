import { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import Image from 'next/image';

// Client-side cache so we don't re-fetch already-processed images
const processedImageCache = new Map<string, string>();

interface TransparentImageProps {
  src: string;
  alt: string;
  className?: string;
  width: number;
  height: number;
}

export function TransparentImage({ src, alt, className = '', width, height }: TransparentImageProps) {
  const [imgSrc, setImgSrc] = useState<string | null>(processedImageCache.get(src) || null);
  const [loading, setLoading] = useState(!processedImageCache.has(src));

  useEffect(() => {
    if (processedImageCache.has(src)) {
      setImgSrc(processedImageCache.get(src)!);
      setLoading(false);
      return;
    }

    let isMounted = true;

    const processImage = async () => {
      setLoading(true);
      try {
        // Call server-side API to remove background (heavy lifting happens on the server)
        const res = await fetch('/api/remove-bg', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: src })
        });

        if (!res.ok) throw new Error('Background removal API failed');
        const { imageData } = await res.json();

        if (isMounted) {
          processedImageCache.set(src, imageData);
          setImgSrc(imageData);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to remove background:', error);
        // Fallback to original image
        if (isMounted) {
          processedImageCache.set(src, src);
          setImgSrc(src);
          setLoading(false);
        }
      }
    };

    processImage();

    return () => {
      isMounted = false;
    };
  }, [src]);

  if (loading || !imgSrc) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full opacity-60">
        <div className="relative">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <Sparkles className="w-3 h-3 text-emerald-400 absolute -top-1 -right-1 animate-pulse" />
        </div>
        <span className="text-[10px] uppercase tracking-widest font-semibold mt-3 text-muted-foreground animate-pulse">
          Removing BG...
        </span>
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      unoptimized
    />
  );
}
