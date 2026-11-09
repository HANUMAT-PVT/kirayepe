import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/60 px-6 py-14 text-center",
        className,
      )}
    >
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-muted">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}