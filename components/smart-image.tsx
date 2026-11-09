import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

const allowedHosts = ["images.unsplash.com", "res.cloudinary.com", "i.pravatar.cc"];

function canOptimize(src: string) {
  if (src.startsWith("/")) return true;
  try {
    return allowedHosts.includes(new URL(src).hostname);
  } catch {
    return false;
  }
}

export function SmartImage({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
  imgClassName,
}: {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  imgClassName?: string;
}) {
  if (!src) {
    return (
      <div
        className={cn(
          "grid h-full w-full place-items-center bg-gradient-to-br from-slate-100 to-brand-50 text-slate-300",
          className,
        )}
      >
        <ImageOff className="h-8 w-8" />
      </div>
    );
  }

  if (!canOptimize(src)) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn("h-full w-full object-cover", className, imgClassName)}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className, imgClassName)}
    />
  );
}