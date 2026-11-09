import Link from "next/link";
import { ArrowUpRight, AtSign, Globe2, Send } from "lucide-react";
import { Brand } from "./brand";

const columns = [
  {
    title: "Explore",
    links: [
      { label: "All products", href: "/products" },
      { label: "Cameras", href: "/products?category=cameras" },
      { label: "Gaming", href: "/products?category=gaming" },
      { label: "Laptops", href: "/products?category=laptops" },
      { label: "Furniture", href: "/products?category=furniture" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "Become a seller", href: "/#become-a-seller" },
      { label: "Trust & safety", href: "/#trust" },
      { label: "Demo accounts", href: "/login" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create account", href: "/signup" },
      { label: "My dashboard", href: "/dashboard" },
      { label: "Admin console", href: "/admin" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="page-shell py-14">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_2fr]">
          <div>
            <Brand className="[&_span]:text-white" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/55">
              Rent what you need, earn from what you own. KirayePe connects
              neighbours and creators across India through a trusted rental
              marketplace.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {[AtSign, Globe2, Send].map((Icon, index) => (
                <span
                  key={index}
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:border-brand-400/50 hover:bg-brand-500/20 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white/60">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              College project · Demo payments only
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-white/65 transition hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} KirayePe. Built for a college showcase.</p>
          <p>Made with Next.js, Prisma & MongoDB · Images via Unsplash</p>
        </div>
      </div>
    </footer>
  );
}