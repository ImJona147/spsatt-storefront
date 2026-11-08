"use client";

import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface DeferredMapProps {
  src: string;
  title: string;
  className?: string;
}

/**
 * The map embed is a third-party document with its own JS payload. Keep it out
 * of the initial page load and mount it only when the section approaches the
 * viewport, so it does not compete with the hero and product images.
 */
export function DeferredMap({
  src,
  title,
  className,
}: DeferredMapProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad) return;

    const node = containerRef.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <iframe
          title={title}
          src={src}
          loading="lazy"
          className="h-full w-full border-0"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground/40"
        >
          <MapPin className="size-10" strokeWidth={1.2} />
        </div>
      )}
    </div>
  );
}
