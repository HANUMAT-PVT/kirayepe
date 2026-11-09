"use client";

import { useState } from "react";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not change password");
      setSuccess("Password updated. Use it the next time you sign in.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700">
          <KeyRound className="h-4 w-4" />
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-ink">
            Change password
          </h2>
          <p className="text-[11px] text-slate-400">
            Passwords are hashed with bcrypt before storage.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <div>
          <label className="label" htmlFor="currentPassword">
            Current password
          </label>
          <input
            id="currentPassword"
            type="password"
            className="input"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="newPassword">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              className="input"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="confirmPassword">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className="input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> {success}
        </p>
      )}

      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
        <button type="submit" disabled={busy} className="btn-primary">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}