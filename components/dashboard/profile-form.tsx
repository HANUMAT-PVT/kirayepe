"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, CheckCircle2, Loader2, Save, UploadCloud } from "lucide-react";
import { z } from "zod";
import { profileSchema } from "@/lib/validation";
import { Avatar } from "@/components/avatar";

type FormValues = z.infer<typeof profileSchema>;

export function ProfileForm({
  defaultValues,
  email,
}: {
  defaultValues: FormValues;
  email: string;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const name = watch("name") || "Your name";
  const avatar = watch("avatar");

  async function uploadAvatar(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setServerError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Upload failed");
      setValue("avatar", data.url, { shouldValidate: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: FormValues) {
    setSaved(false);
    setServerError("");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      setServerError(data.error ?? "Could not save profile");
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative">
          <Avatar name={name} src={avatar} size="xl" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-brand-600 text-white shadow-md transition hover:bg-brand-700"
            title="Upload avatar"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(event) => uploadAvatar(event.target.files?.[0])}
          />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-ink">Profile photo</p>
          <p className="text-[11px] text-slate-400">
            A clear face photo helps build trust. JPG, PNG or WebP up to 5MB.
          </p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn-secondary btn-sm mt-2"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            {uploading ? "Uploading…" : "Upload new photo"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">
            Full name
          </label>
          <input id="name" className="input" {...register("name")} />
          {errors.name && (
            <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            className="input bg-slate-50 text-slate-400"
            value={email}
            readOnly
          />
          <p className="mt-1 text-[10px] text-slate-400">
            Email is used for login and cannot be changed in this demo.
          </p>
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone number
          </label>
          <input
            id="phone"
            className="input"
            placeholder="+91 98765 43210"
            {...register("phone")}
          />
        </div>
        <div>
          <label className="label" htmlFor="city">
            City
          </label>
          <input
            id="city"
            className="input"
            placeholder="Mumbai"
            {...register("city")}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="bio">
            About you
          </label>
          <textarea
            id="bio"
            className="textarea"
            rows={4}
            placeholder="Tell renters a little about yourself and how you like to rent."
            {...register("bio")}
          />
          {errors.bio && (
            <p className="mt-1 text-xs text-rose-600">{errors.bio.message}</p>
          )}
        </div>
      </div>

      {serverError && (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
          {serverError}
        </p>
      )}
      {saved && (
        <p className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" /> Profile updated successfully.
        </p>
      )}

      <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}