"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Mail, Shield, UserX } from "lucide-react";

export function SettingsPanel({
  email,
  role,
}: {
  email: string;
  role: string;
}) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [prefs, setPrefs] = useState({
    bookingEmails: true,
    messageEmails: true,
    marketing: false,
  });

  async function logout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Mail className="h-4 w-4 text-brand-600" /> Notifications
        </h2>
        <p className="mt-1 text-[11px] text-slate-400">
          Choose what KirayePe should notify you about. Preferences are stored in
          this demo session only.
        </p>
        <div className="mt-4 space-y-2">
          {[
            {
              key: "bookingEmails" as const,
              label: "Booking updates",
              description: "Confirmations, cancellations and reminders.",
            },
            {
              key: "messageEmails" as const,
              label: "New messages",
              description: "When a renter or owner sends you a message.",
            },
            {
              key: "marketing" as const,
              label: "Product highlights",
              description: "Occasional curated rentals and offers.",
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-100 px-4 py-3"
            >
              <div>
                <p className="text-xs font-semibold text-ink">{item.label}</p>
                <p className="text-[10px] text-slate-400">{item.description}</p>
              </div>
              <span className="relative inline-flex items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={prefs[item.key]}
                  onChange={(event) =>
                    setPrefs((current) => ({
                      ...current,
                      [item.key]: event.target.checked,
                    }))
                  }
                />
                <span
                  className={`h-6 w-11 rounded-full transition ${
                    prefs[item.key] ? "bg-brand-600" : "bg-slate-300"
                  }`}
                />
                <span
                  className={`absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    prefs[item.key] ? "translate-x-5" : ""
                  }`}
                />
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Shield className="h-4 w-4 text-brand-600" /> Account & security
        </h2>
        <div className="mt-3 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2.5 text-xs">
            <span className="text-slate-500">Login email</span>
            <span className="font-medium text-ink">{email}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-xs">
            <span className="text-slate-500">Account role</span>
            <span className="badge bg-brand-50 text-brand-700">{role}</span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-xs">
            <span className="text-slate-500">Session security</span>
            <span className="font-medium text-emerald-600">
              Signed JWT · httpOnly cookie
            </span>
          </div>
          <div className="flex items-center justify-between py-2.5 text-xs">
            <span className="text-slate-500">Password hashing</span>
            <span className="font-medium text-ink">bcrypt (10 rounds)</span>
          </div>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <UserX className="h-4 w-4 text-rose-500" /> Demo account controls
        </h2>
        <p className="mt-1 text-[11px] text-slate-400">
          This project runs on demo data. Signing out ends this session instantly.
        </p>
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="btn-secondary mt-3 border-rose-200 text-rose-600 hover:bg-rose-50"
        >
          {loggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          {loggingOut ? "Signing out…" : "Sign out of KirayePe"}
        </button>
      </div>
    </div>
  );
}