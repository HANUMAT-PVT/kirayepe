"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { loginSchema } from "@/lib/validation";
import { z } from "zod";

type FormValues = z.infer<typeof loginSchema>;

const demos = [
  { label: "Admin", email: "admin@kirayepe.com" },
  { label: "User", email: "user@kirayepe.com" },
  { label: "Seller", email: "seller@kirayepe.com" },
];

export function LoginForm({ nextPath }: { nextPath: string }) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: FormValues) {
    setServerError("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      setServerError(data.error ?? "Could not sign in");
      return;
    }
    router.push(data.role === "ADMIN" && nextPath === "/" ? "/admin" : nextPath);
    router.refresh();
  }

  function fillDemo(email: string) {
    setValue("email", email);
    setValue("password", "KirayePe@123");
    setServerError("");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="label" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input"
          placeholder="you@example.com"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="label" htmlFor="password">
            Password
          </label>
          <span className="text-[11px] font-medium text-slate-400">
            Demo password: KirayePe@123
          </span>
        </div>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="input pr-11"
            placeholder="Enter your password"
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs text-rose-600">
            {errors.password.message}
          </p>
        )}
      </div>

      {serverError && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary btn-lg w-full"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>

      <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/60 p-3.5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
          Quick demo login
        </p>
        <div className="grid grid-cols-3 gap-2">
          {demos.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => fillDemo(demo.email)}
              className="rounded-xl border border-white bg-white px-2 py-2 text-[11px] font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
            >
              {demo.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted">
        New to KirayePe?{" "}
        <Link
          href="/signup"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Create an account
        </Link>
      </p>
    </form>
  );
}