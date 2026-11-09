import Link from "next/link";
import { cn } from "@/lib/utils";

export function Brand({
  compact = false,
  className,
  href = "/",
}: {
  compact?: boolean;
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("group inline-flex items-center gap-2.5", className)}>
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-[12px] bg-gradient-to-br from-brand-500 via-brand-600 to-brand-800 shadow-[0_8px_18px_-8px_rgba(6,124,102,0.8)]">
        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-white/25" />
        <span className="font-display text-lg font-bold text-white">K</span>
      </span>
      {!compact && (
        <span className="font-display text-[1.35rem] font-semibold tracking-[-0.04em] text-ink">
          Kiraye<span className="text-brand-600">Pe</span>
        </span>
      )}
    </Link>
  );
}