"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShieldCheck,
  User as UserIcon,
  X,
} from "lucide-react";
import { Brand } from "./brand";
import { Avatar } from "./avatar";
import { cn } from "@/lib/utils";

export type HeaderUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
};

const navLinks = [
  { href: "/products", label: "Explore" },
  { href: "/products?sort=newest", label: "New arrivals" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#become-a-seller", label: "Become a seller" },
];

const categoryLinks = [
  { name: "Cameras", slug: "cameras" },
  { name: "Gaming", slug: "gaming" },
  { name: "Audio", slug: "audio" },
  { name: "Laptops", slug: "laptops" },
  { name: "Furniture", slug: "furniture" },
  { name: "Bikes", slug: "bikes-scooters" },
  { name: "Party", slug: "party-events" },
  { name: "Fitness", slug: "fitness" },
];

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setAccountOpen(false);
    router.push("/");
    router.refresh();
    setLoggingOut(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/85 backdrop-blur-xl">
      <div className="border-b border-slate-100/80 bg-ink text-white">
        <div className="page-shell flex h-8 items-center justify-between text-[11px] font-medium tracking-wide">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            India&apos;s rental marketplace — demo project
          </span>
          <span className="hidden text-white/60 sm:block">
            Rent smart. Live light. Save more.
          </span>
        </div>
      </div>

      <div className="page-shell flex h-[72px] items-center gap-4">
        <Brand />

        <form action="/products" className="hidden flex-1 lg:block">
          <div className="group relative mx-auto max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-600" />
            <input
              name="q"
              placeholder="Search cameras, PS5, furniture…"
              className="h-11 w-full rounded-full border border-slate-200 bg-slate-50/80 pl-10 pr-24 text-sm outline-none transition focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 rounded-full bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
            >
              Search
            </button>
          </div>
        </form>

        <nav className="hidden items-center gap-1 xl:flex">
          {navLinks.slice(0, 2).map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink",
                pathname === link.href && "bg-slate-100 text-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          {user ? (
            <>
              <Link
                href="/dashboard/wishlist"
                className="hidden rounded-full p-2.5 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 sm:block"
                aria-label="Wishlist"
              >
                <Heart className="h-[19px] w-[19px]" />
              </Link>
              <Link
                href="/dashboard/messages"
                className="hidden rounded-full p-2.5 text-slate-500 transition hover:bg-brand-50 hover:text-brand-700 sm:block"
                aria-label="Messages"
              >
                <MessageCircle className="h-[19px] w-[19px]" />
              </Link>
              <Link
                href="/dashboard/listings/new"
                className="btn-primary btn-sm hidden md:inline-flex"
              >
                <Plus className="h-4 w-4" /> List an item
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-2.5 transition hover:border-brand-200 hover:shadow-sm"
                >
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <span className="hidden max-w-[90px] truncate text-xs font-semibold text-slate-700 sm:block">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {accountOpen && (
                  <>
                    <button
                      className="fixed inset-0 z-40 cursor-default"
                      aria-label="Close menu"
                      onClick={() => setAccountOpen(false)}
                    />
                    <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-[0_24px_60px_-20px_rgba(21,19,31,0.35)]">
                      <div className="mb-1 rounded-xl bg-slate-50 px-3 py-2.5">
                        <p className="truncate text-sm font-semibold text-ink">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Link>
                      <Link
                        href="/dashboard/rentals"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Package className="h-4 w-4" /> My rentals
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-brand-50 hover:text-brand-700"
                      >
                        <UserIcon className="h-4 w-4" /> Profile
                      </Link>
                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-700 transition hover:bg-brand-50"
                        >
                          <ShieldCheck className="h-4 w-4" /> Admin console
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={logout}
                        disabled={loggingOut}
                        className="mt-1 flex w-full items-center gap-2.5 rounded-xl border-t border-slate-100 px-3 pt-3 pb-2.5 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:opacity-60"
                      >
                        {loggingOut ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                        {loggingOut ? "Signing out…" : "Sign out"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost btn-sm hidden sm:inline-flex">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}

          <button
            type="button"
            className="rounded-full p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="hidden border-t border-slate-100/80 lg:block">
        <div className="page-shell flex h-10 items-center gap-1 overflow-x-auto no-scrollbar">
          <Link
            href="/products"
            className="mr-1 whitespace-nowrap rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700"
          >
            All products
          </Link>
          {categoryLinks.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-ink"
            >
              {category.name}
            </Link>
          ))}
          <Link
            href="/products?sort=popular"
            className="ml-auto whitespace-nowrap text-xs font-semibold text-brand-700"
          >
            Trending rentals →
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 lg:hidden">
          <form action="/products" className="mb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                placeholder="Search rentals…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-brand-300"
              />
            </div>
          </form>
          <div className="grid gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/listings/new"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
                >
                  List an item
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}