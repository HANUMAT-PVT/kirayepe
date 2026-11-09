import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  size = "sm",
  className,
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Star
        className={cn(
          "fill-amber-400 text-amber-400",
          size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4",
        )}
      />
      <span
        className={cn(
          "font-semibold text-ink",
          size === "sm" ? "text-xs" : "text-sm",
        )}
      >
        {value > 0 ? value.toFixed(1) : "New"}
      </span>
      {typeof count === "number" && count > 0 && (
        <span className="text-xs text-muted">({count})</span>
      )}
    </span>
  );
}

export function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="rounded-md p-0.5 transition hover:scale-110"
          aria-label={`${star} star`}
        >
          <Star
            className={cn(
              "h-5 w-5",
              star <= value
                ? "fill-amber-400 text-amber-400"
                : "text-slate-300",
            )}
          />
        </button>
      ))}
    </div>
  );
}