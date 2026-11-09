import { cn, initials } from "@/lib/utils";

export function Avatar({
  name,
  src,
  size = "md",
  className,
}: {
  name: string;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    xs: "h-6 w-6 text-[9px]",
    sm: "h-8 w-8 text-[10px]",
    md: "h-10 w-10 text-xs",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-xl",
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          "shrink-0 rounded-full object-cover ring-2 ring-white",
          sizes[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-semibold text-white ring-2 ring-white",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}