"use client";

import { useState } from "react";
import Image from "next/image";
import { AvatarGenerator } from "./avatar-generator";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string | null | undefined;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSeed?: string;
  priority?: boolean;
  unoptimized?: boolean;
}

/**
 * Optimized image component using next/image with error handling and fallback
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSeed,
  priority = false,
  unoptimized = false,
}: OptimizedImageProps) {
  const [error, setError] = useState(false);

  // If no src or error occurred, show fallback
  if (!src || error) {
    if (fallbackSeed) {
      return <AvatarGenerator seed={fallbackSeed} size={width} />;
    }
    return (
      <div
        className={cn(
          "bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center",
          className
        )}
        style={{ width, height }}
      >
        <span className="text-neutral-400 text-xs">No image</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      priority={priority}
      unoptimized={unoptimized}
    />
  );
}

interface OptimizedAvatarProps {
  src: string | null | undefined;
  alt: string;
  size: number;
  fallbackSeed: string;
  className?: string;
  priority?: boolean;
}

/**
 * Optimized avatar component - always circular with fallback
 */
export function OptimizedAvatar({
  src,
  alt,
  size,
  fallbackSeed,
  className,
  priority = false,
}: OptimizedAvatarProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <AvatarGenerator seed={fallbackSeed} size={size} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("rounded-full object-cover", className)}
      onError={() => setError(true)}
      priority={priority}
      unoptimized
    />
  );
}

interface BackgroundImageProps {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  className?: string;
  onError?: () => void;
}

/**
 * Background/decorative image component with fill mode
 */
export function BackgroundImage({
  src,
  alt,
  fill = true,
  className,
  onError,
}: BackgroundImageProps) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={cn("object-cover", className)}
      onError={() => {
        setError(true);
        onError?.();
      }}
      unoptimized
    />
  );
}
