import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}

export function ResilientImage({
  src,
  alt,
  className = '',
  loading = 'eager',
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-500 p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <ShoppingBag className="w-6 h-6 mb-2 text-neutral-400" />
        <span className="text-xs font-medium line-clamp-2 max-w-[16ch]">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
