import { useState } from 'react';
import { Landmark } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle = 'My Savings Companion',
  fallbackSubtitle = 'Community Savings Infrastructure',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-slate-100 border border-slate-200 text-slate-600 p-8 text-center ${className}`}
      >
        <Landmark className="w-8 h-8 text-emerald-800 mb-3" strokeWidth={1.5} />
        <p className="font-display font-semibold text-slate-900 text-base">{fallbackTitle}</p>
        <p className="text-xs text-slate-500 mt-1">{fallbackSubtitle}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
