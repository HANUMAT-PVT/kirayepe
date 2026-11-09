"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SmartImage } from "@/components/smart-image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : [""];

  function move(direction: number) {
    setActive(
      (current) => (current + direction + safeImages.length) % safeImages.length,
    );
  }

  return (
    <div>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-slate-100">
        <SmartImage
          src={safeImages[active]}
          alt={`${title} — image ${active + 1}`}
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
          {active + 1} / {safeImages.length}
        </div>
      </div>

      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                "relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 transition",
                active === index
                  ? "border-brand-500"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <SmartImage src={image} alt={`Thumbnail ${index + 1}`} sizes="140px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}