"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
];

export function AdminSidebar({ name }: { name: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <div className="flex h-full flex-col bg-ink text-white">
      <div className="flex items-center justify-between px-5 py-5">
        <Brand className="[&_span]:text-white" />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/25 text-brand-200">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold">{name}</p>
            <p className="text-[9px] uppercase tracking-wide text-white/40">
              Administrator
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-0.5 px-3">
        <p className="mb-1.5 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          Console
        </p>
        {links.map((link) => {
          const active =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition",
                active
                  ? "bg-brand-600 text-white shadow-[0_10px_24px_-12px_rgba(6,124,102,1)]"
                  : "text-white/55 hover:bg-white/[0.07] hover:text-white",
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}

        <p className="mb-1.5 mt-5 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-white/30">
          Shortcuts
        </p>
        <Link
          href="/products"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-white/55 transition hover:bg-white/[0.07] hover:text-white"
        >
          <ExternalLink className="h-4 w-4" /> View marketplace
        </Link>
        <Link
          href="/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-white/55 transition hover:bg-white/[0.07] hover:text-white"
        >
          <BarChart3 className="h-4 w-4" /> My workspace
        </Link>
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-rose-300 transition hover:bg-rose-500/10"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen lg:block">{nav}</aside>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600"
          aria-label="Open admin menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] shadow-2xl">{nav}</div>
        </div>
      )}
    </>
  );
}