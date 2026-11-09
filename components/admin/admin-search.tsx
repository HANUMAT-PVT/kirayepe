"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";

export function AdminSearch({
  param = "q",
  placeholder,
  defaultValue,
}: {
  param?: string;
  placeholder: string;
  defaultValue?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(defaultValue ?? "");
  const [busy, setBusy] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) params.set(param, value.trim());
    else params.delete(param);
    params.delete("page");
    router.push(`${window.location.pathname}?${params.toString()}`);
    window.setTimeout(() => setBusy(false), 300);
  }

  return (
    <form onSubmit={submit} className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-20 text-xs outline-none focus:border-brand-300 focus:ring-4 focus:ring-brand-50"
      />
      <button
        type="submit"
        disabled={busy}
        className="absolute right-1 top-1 rounded-lg bg-brand-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-brand-700"
      >
        {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : "Search"}
      </button>
    </form>
  );
}