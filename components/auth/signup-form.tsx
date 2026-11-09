"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { signupSchema } from "@/lib/validation";
import { z } from "zod";

type FormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", city: "" },
  });

  async function onSubmit(values: FormValues) {
    setServerError("");
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      setServerError(data.error ?? "Could not create account");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label" htmlFor="name">
          Full name
        </label>
        <input
          id="name"
          className="input"
          placeholder="Aarav Sharma"
          autoComplete="name"
          {...register("name")}
        />
        {errors.name && (
          <p className="mt-1.5 text-xs text-rose-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="email">
          Email address
        </label>
        <input
          id="email"
          type="email"
          className="input"
          placeholder="you@example.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs text-rose-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="city">
          City <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="city"
          className="input"
          placeholder="Mumbai"
          {...register("city")}
        />
        {errors.city && (
          <p className="mt-1.5 text-xs text-rose-600">{errors.city.message}</p>
        )}
      </div>

      <div>
        <label className="label" htmlFor="password">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            className="input pr-11"
            placeholder="At least 8 characters"
            autoComplete="new-password"
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
          <UserPlus className="h-4 w-4" />
        )}
        {isSubmitting ? "Creating account…" : "Create free account"}
      </button>

      <p className="text-center text-xs leading-relaxed text-slate-400">
        By joining, you agree to KirayePe&apos;s demo terms. All payments on this
        platform are simulated for academic evaluation.
      </p>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}