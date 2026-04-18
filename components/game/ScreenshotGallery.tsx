"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { ScreenshotVM } from "@/types/viewModels";

interface Props {
  screenshots: ScreenshotVM[];
  gameTitle: string;
}

export function ScreenshotGallery({ screenshots, gameTitle }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const openLightbox = (i: number, el: HTMLButtonElement) => {
    triggerRef.current = el;
    setLightboxIndex(i);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    triggerRef.current?.focus();
  };

  // Use functional updates so these never go stale inside the keydown handler
  const prev = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + screenshots.length) % screenshots.length,
    );
  const next = () =>
    setLightboxIndex((i) =>
      i === null ? null : (i + 1) % screenshots.length,
    );

  // Single listener: attached on open, removed on close — not re-registered on navigation
  useEffect(() => {
    if (lightboxIndex === null) return;
    closeRef.current?.focus();

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
    // lightboxIndex intentionally omitted: open/closed state is the only meaningful boundary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIndex !== null]);

  return (
    <>
      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2" role="list" aria-label="Screenshots">
        {screenshots.slice(0, 8).map((sc, i) => (
          <div key={sc.id} role="listitem" className="shrink-0">
            <button
              onClick={(e) => openLightbox(i, e.currentTarget)}
              className="relative w-32 h-20 lg:w-48 lg:h-28 rounded-lg overflow-hidden game-card-hover block focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              aria-label={`View screenshot ${i + 1} of ${screenshots.length} from ${gameTitle}`}
            >
              <Image
                src={sc.url}
                alt={`${gameTitle} screenshot ${i + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 192px, 128px"
                loading="lazy"
              />
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Screenshot ${lightboxIndex + 1} of ${screenshots.length} — ${gameTitle}`}
          className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={closeLightbox}
        >
          {/* Stop propagation on inner content */}
          <div
            className="relative max-w-5xl w-full max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={screenshots[lightboxIndex].url}
              alt={`${gameTitle} screenshot ${lightboxIndex + 1}`}
              width={screenshots[lightboxIndex].width || 1280}
              height={screenshots[lightboxIndex].height || 720}
              className="w-full h-auto rounded-lg object-contain max-h-[85vh]"
            />
          </div>

          {/* Controls */}
          <button
            ref={closeRef}
            onClick={closeLightbox}
            aria-label="Close lightbox"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <X size={20} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous screenshot"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next screenshot"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            <ChevronRight size={20} />
          </button>

          {/* Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-tag">
            {lightboxIndex + 1} / {screenshots.length}
          </div>
        </div>
      )}
    </>
  );
}
