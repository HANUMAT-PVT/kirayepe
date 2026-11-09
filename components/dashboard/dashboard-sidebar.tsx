"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  PlusCircle,
  Settings,
  ShieldCheck,
  Store,
  User,
  X,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { Avatar } from "@/components/avatar";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/rentals", label: "My rentals", icon: Package },
  { href: "/dashboard/listings", label: "My listings", icon: Store },
  { href: "/dashboard/listings/new", label: "Add product", icon: PlusCircle },
  { href: "/dashboard/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar({
  user,
  unreadCount,
}: {
  user: { id: string; name: string; email: string; avatar: string | null; role: string };
  unreadCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const nav = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 py-5">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mx-4 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar name={user.name} src={user.avatar} size="md" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-ink">{user.name}</p>
            <p className="truncate text-[10px] text-slate-400">{user.email}</p>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-[9px] font-semibold text-brand-700">
          <ShieldCheck className="h-3 w-3" /> Verified KirayePe member
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-0.5 overflow-y-auto px-3">
        <p className="mb-1.5 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Workspace
        </p>
        {links.map((link) => {
          const active =
            link.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition",
                active
                  ? "bg-brand-600 text-white shadow-[0_10px_20px_-12px_rgba(109,40,217,0.9)]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-ink",
              )}
            >
              <link.icon
                className={cn(
                  "h-4 w-4",
                  active ? "text-white" : "text-slate-400 group-hover:text-brand-600",
                )}
              />
              <span className="flex-1">{link.label}</span>
              {link.href === "/dashboard/messages" && unreadCount > 0 && (
                <span
                  className={cn(
                    "grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold",
                    active ? "bg-white text-brand-700" : "bg-brand-100 text-brand-700",
                  )}
                >
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}

        {user.role === "ADMIN" && (
          <>
            <p className="mb-1.5 mt-5 px-3 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              Administration
            </p>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-ink"
            >
              <ShieldCheck className="h-4 w-4 text-slate-400 group-hover:text-brand-600" />
              Admin console
            </Link>
          </>
        )}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <Link
          href="/products"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-ink"
        >
          <Store className="h-4 w-4 text-slate-400" />
          Browse marketplace
        </Link>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium text-rose-500 transition hover:bg-rose-50"
        >
          <LogOut className="h-4 w-4" />
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen border-r border-slate-200/80 bg-white lg:block">
        {nav}
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-xl border border-slate-200 p-2 text-slate-600"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
          />
          <div className="absolute inset-y-0 left-0 w-[280px] bg-white shadow-2xl">
            {nav}
          </div>
        </div>
      )}
    </>
  );
}