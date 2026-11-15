"use client";

import type { LucideIcon } from "lucide-react";
import { ImageIcon } from "lucide-react";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const BLUR_PLACEHOLDER =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIElEQVQYV2P4////MwwMDAxMDAwMDGQJMJCvkGwNZCsEAGebBwVss9lRAAAAAElFTkSuQmCC";

type ProductImageProps = Omit<ImageProps, "src"> & {
  src: string | null | undefined;
  iconClassName?: string;
  icon?: LucideIcon;
};

export function ProductImage({
  src,
  iconClassName = "w-8 h-8",
  icon: Icon = ImageIcon,
  onError,
  onLoad,
  fetchPriority,
  placeholder = "blur",
  blurDataURL = BLUR_PLACEHOLDER,
  className,
  ...rest
}: ProductImageProps): React.JSX.Element {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
        <Icon className={iconClassName} />
      </div>
    );
  }

  return (
    <Image
      src={src}
      key={src}
      onError={(e) => {
        setFailedSrc(src);
        onError?.(e);
      }}
      onLoad={(e) => {
        onLoad?.(e);
      }}
      className={cn(
        className,
        "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
        "product-image-reveal",
      )}
      fetchPriority={fetchPriority}
      loading={fetchPriority === "high" ? "eager" : undefined}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      {...rest}
    />
  );
}
