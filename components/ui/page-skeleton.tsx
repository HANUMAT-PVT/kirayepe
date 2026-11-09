function Block({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-200/70 ${className}`}
    />
  );
}

export function PageSkeleton({
  variant = "grid",
}: {
  variant?: "grid" | "detail" | "dashboard" | "admin";
}) {
  if (variant === "detail") {
    return (
      <div className="page-shell py-8">
        <div className="flex gap-2">
          <Block className="h-3 w-14" />
          <Block className="h-3 w-3" />
          <Block className="h-3 w-20" />
        </div>
        <Block className="mt-6 h-8 w-2/3 max-w-xl" />
        <div className="mt-2 flex gap-3">
          <Block className="h-4 w-24" />
          <Block className="h-4 w-32" />
        </div>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1.6fr_0.75fr]">
          <div>
            <Block className="aspect-[4/3] w-full rounded-3xl" />
            <div className="mt-3 flex gap-2">
              {[0, 1, 2].map((item) => (
                <Block key={item} className="h-20 w-28" />
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[0, 1, 2, 3, 4].map((item) => (
                <Block key={item} className="h-16" />
              ))}
            </div>
            <Block className="mt-8 h-4 w-40" />
            <div className="mt-4 space-y-2">
              <Block className="h-3 w-full" />
              <Block className="h-3 w-11/12" />
              <Block className="h-3 w-9/12" />
            </div>
          </div>
          <div>
            <Block className="h-[430px] w-full rounded-3xl" />
            <Block className="mt-4 h-28 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="space-y-5">
        <Block className="h-3 w-24" />
        <Block className="h-8 w-64" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Block key={item} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Block className="h-20 rounded-2xl" />
          <Block className="h-20 rounded-2xl" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
          <Block className="h-72 rounded-2xl" />
          <div className="space-y-4">
            <Block className="h-36 rounded-2xl" />
            <Block className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className="space-y-4">
        <Block className="h-3 w-20" />
        <div className="flex items-end justify-between gap-4">
          <Block className="h-8 w-56" />
          <Block className="h-9 w-36" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Block key={item} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
          <Block className="h-80 rounded-2xl" />
          <Block className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-10">
      <div className="flex items-end justify-between gap-4 border-b border-slate-200/70 pb-6">
        <div className="space-y-3">
          <Block className="h-3 w-28" />
          <Block className="h-8 w-64" />
          <Block className="h-3 w-80 max-w-full" />
        </div>
        <Block className="h-9 w-32" />
      </div>
      <div className="mt-7 grid gap-8 lg:grid-cols-[245px_1fr]">
        <div className="hidden space-y-4 lg:block">
          <Block className="h-80 rounded-2xl" />
          <Block className="h-40 rounded-2xl" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-white bg-white p-3">
              <Block className="aspect-[4/3] w-full rounded-2xl" />
              <Block className="mt-3 h-4 w-4/5" />
              <Block className="mt-2 h-3 w-1/2" />
              <div className="mt-4 flex justify-between">
                <Block className="h-5 w-20" />
                <Block className="h-4 w-12" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}