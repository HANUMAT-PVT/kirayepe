import { cn } from "@/lib/utils";

export function StatusBadge({
  status,
  styles,
  className,
}: {
  status: string;
  styles: Record<string, string>;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "badge ring-1 ring-inset",
        styles[status] ?? "bg-slate-100 text-slate-700 ring-slate-200",
        className,
      )}
    >
      {(status.charAt(0) + status.slice(1).toLowerCase()).replaceAll("_", " ")}
    </span>
  );
}