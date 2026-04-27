'use client';

import Image, { ImageProps } from 'next/image';
import { useState } from 'react';

const FALLBACK = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect width="400" height="400" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%2394a3b8"%3ENo Image%3C/text%3E%3C/svg%3E';

export default function SafeImage(props: ImageProps) {
  const [src, setSrc] = useState<ImageProps['src']>(props.src || FALLBACK);
  return (
    <Image
      {...props}
      src={src}
      onError={() => setSrc(FALLBACK)}
    />
  );
}
