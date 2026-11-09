import { Brand } from "@/components/brand";
import { SmartImage } from "@/components/smart-image";
import { ShieldCheck, Sparkles, Star } from "lucide-react";

const collage = [
  {
    src: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=80",
    label: "Sony A7 III",
    sub: "₹1,499 / day",
    className: "col-span-2 row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=600&q=80",
    label: "PlayStation 5",
    sub: "₹549 / day",
    className: "",
  },
  {
    src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
    label: "Sony WH-1000XM5",
    sub: "₹349 / day",
    className: "",
  },
];

export function AuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden bg-ink p-10 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 surface-grid opacity-[0.18]" />
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-brand-600/40 blur-[100px]" />
        <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-[110px]" />

        <div className="relative z-10">
          <Brand className="[&_span]:text-white" />
        </div>

        <div className="relative z-10 mt-16 max-w-lg">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
            <Sparkles className="h-3.5 w-3.5 text-brand-300" />
            Rent better. Own less.
          </div>
          <h2 className="mt-5 font-display text-[2.6rem] font-semibold leading-[1.08] tracking-[-0.045em]">
            The things you need,
            <br />
            <span className="bg-gradient-to-r from-brand-300 via-brand-200 to-fuchsia-200 bg-clip-text text-transparent">
              only for as long as you need.
            </span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/55">
            Cameras for the weekend. A PS5 for the holidays. Furniture for your
            new flat. KirayePe makes renting effortless — and earning simple.
          </p>
        </div>

        <div className="relative z-10 mt-auto grid grid-cols-4 grid-rows-3 gap-2.5 pt-10">
          {collage.map((item) => (
            <div
              key={item.label}
              className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 ${item.className}`}
            >
              <SmartImage src={item.src} alt={item.label} sizes="400px" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[10px] text-white/60">{item.sub}</p>
              </div>
            </div>
          ))}
          <div className="col-span-2 flex flex-col justify-center rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className="h-3 w-3 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-white/65">
              “Got a full camera kit for my Goa trip. Saved ₹40,000 on buying
              one.”
            </p>
            <p className="mt-1.5 text-[10px] font-semibold text-white/40">
              Aarav · Mumbai
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-6 sm:px-10">
          <div className="lg:hidden">
            <Brand />
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] font-medium text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure demo authentication
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-14 pt-4 sm:px-10">
          <div className="w-full max-w-md animate-fade-up">
            <p className="section-eyebrow">Welcome to KirayePe</p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}