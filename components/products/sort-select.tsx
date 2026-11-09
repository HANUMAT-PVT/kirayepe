"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

const options = [
  { value: "newest", label: "Newest first" },
  { value: "popular", label: "Most popular" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
];

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", next);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
      <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
      <select
        value={value}
        onChange={(event) => update(event.target.value)}
        className="bg-transparent text-xs font-medium text-slate-700 outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}