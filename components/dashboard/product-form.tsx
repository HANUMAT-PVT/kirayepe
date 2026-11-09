"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ImagePlus,
  IndianRupee,
  Info,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { CITIES, CONDITION_OPTIONS, CONDITION_LABELS } from "@/lib/constants";
import { productSchema, type ProductInput } from "@/lib/validation";
import { cn, formatINR } from "@/lib/utils";
import { SmartImage } from "@/components/smart-image";

type Category = { id: string; name: string };

const emptyValues: ProductInput = {
  title: "",
  description: "",
  categoryId: "",
  brand: "",
  condition: "GOOD",
  images: [],
  dailyPrice: 0,
  weeklyPrice: 0,
  monthlyPrice: 0,
  sixMonthPrice: 0,
  yearlyPrice: 0,
  extraDayPrice: 0,
  securityDeposit: 0,
  location: "",
  city: "",
  isAvailable: true,
};

function Section({
  title,
  description,
  children,
  icon,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700">
          {icon}
        </span>
        <div>
          <h2 className="font-display text-base font-semibold text-ink">
            {title}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ProductForm({
  categories,
  initial,
}: {
  categories: Category[];
  initial?: ProductInput & { id: string };
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: initial ?? emptyValues,
    mode: "onBlur",
  });

  const images = watch("images");
  const dailyPrice = watch("dailyPrice");
  const available = watch("isAvailable");

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = 6 - images.length;
    if (remaining <= 0) {
      setUploadError("You can add up to 6 images.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const urls: string[] = [];
    try {
      for (const file of Array.from(files).slice(0, remaining)) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Upload failed");
        urls.push(data.url);
      }
      setValue("images", [...images, ...urls], { shouldValidate: true });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    setValue(
      "images",
      images.filter((_, itemIndex) => itemIndex !== index),
      { shouldValidate: true },
    );
  }

  function makeCover(index: number) {
    const next = [...images];
    const [selected] = next.splice(index, 1);
    setValue("images", [selected, ...next], { shouldValidate: true });
  }

  function addImageUrl() {
    const value = imageUrl.trim();
    if (!value) return;
    if (!value.startsWith("http://") && !value.startsWith("https://") && !value.startsWith("/")) {
      setUploadError("Enter a valid image URL starting with https://");
      return;
    }
    if (images.length >= 6) {
      setUploadError("You can add up to 6 images.");
      return;
    }
    setValue("images", [...images, value], { shouldValidate: true });
    setImageUrl("");
    setUploadError("");
  }

  function autoFillPrices() {
    const daily = getValues("dailyPrice");
    if (!daily || daily < 1) {
      setUploadError("Add a daily price first to auto-fill package prices.");
      return;
    }
    setValue("weeklyPrice", Math.round(daily * 5.5), { shouldValidate: true });
    setValue("monthlyPrice", Math.round(daily * 18), { shouldValidate: true });
    setValue("sixMonthPrice", Math.round(daily * 90), { shouldValidate: true });
    setValue("yearlyPrice", Math.round(daily * 160), { shouldValidate: true });
    setValue("extraDayPrice", Math.round(daily * 1.2), {
      shouldValidate: true,
    });
  }

  async function onSubmit(values: ProductInput) {
    setServerError("");
    const response = await fetch(
      initial ? `/api/products/${initial.id}` : "/api/products",
      {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      setServerError(data.error ?? "Could not save your listing");
      return;
    }
    router.push("/dashboard/listings?saved=1");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Section
        icon={<Sparkles className="h-5 w-5" />}
        title="Product basics"
        description="A clear title and honest description get more bookings."
      >
        <div className="space-y-4">
          <div>
            <label className="label" htmlFor="title">
              Listing title
            </label>
            <input
              id="title"
              className="input"
              placeholder="e.g. Sony Alpha A7 III with 28-70mm lens"
              {...register("title")}
            />
            {errors.title && (
              <p className="mt-1.5 text-xs text-rose-600">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="label" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="textarea"
              rows={5}
              placeholder="What's included? Any wear and tear? What should renters know?"
              {...register("description")}
            />
            <div className="mt-1 flex justify-between">
              {errors.description ? (
                <p className="text-xs text-rose-600">
                  {errors.description.message}
                </p>
              ) : (
                <p className="text-[10px] text-slate-400">
                  Mention accessories, condition and pickup instructions.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="categoryId">
                Category
              </label>
              <select id="categoryId" className="input" {...register("categoryId")}>
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1.5 text-xs text-rose-600">
                  {errors.categoryId.message}
                </p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="brand">
                Brand
              </label>
              <input
                id="brand"
                className="input"
                placeholder="Sony"
                {...register("brand")}
              />
              {errors.brand && (
                <p className="mt-1.5 text-xs text-rose-600">{errors.brand.message}</p>
              )}
            </div>
            <div>
              <label className="label" htmlFor="condition">
                Condition
              </label>
              <select id="condition" className="input" {...register("condition")}>
                {CONDITION_OPTIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {CONDITION_LABELS[condition]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Section>

      <Section
        icon={<ImagePlus className="h-5 w-5" />}
        title="Photos"
        description="Add up to 6 photos. The first image becomes your cover."
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(event) => uploadFiles(event.target.files)}
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100"
            >
              <SmartImage src={image} alt={`Product image ${index + 1}`} sizes="300px" />
              {index === 0 && (
                <span className="absolute left-2 top-2 badge bg-brand-600 text-white">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1 opacity-0 transition group-hover:opacity-100">
                {index !== 0 && (
                  <button
                    type="button"
                    onClick={() => makeCover(index)}
                    className="rounded-lg bg-white/95 p-1.5 text-slate-700 shadow-sm"
                    title="Make cover"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="ml-auto rounded-lg bg-white/95 p-1.5 text-rose-600 shadow-sm"
                  title="Remove image"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {images.length < 6 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 text-slate-400 transition hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600"
            >
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <UploadCloud className="h-6 w-6" />
              )}
              <span className="text-[11px] font-semibold">
                {uploading ? "Uploading…" : "Upload photo"}
              </span>
              <span className="text-[9px]">JPG, PNG, WebP · max 5MB</span>
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            className="input"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="Or paste an image URL"
          />
          <button type="button" onClick={addImageUrl} className="btn-secondary btn-sm">
            Add URL
          </button>
        </div>

        {errors.images && (
          <p className="mt-2 text-xs text-rose-600">{errors.images.message}</p>
        )}
        {uploadError && (
          <p className="mt-2 text-xs text-rose-600">{uploadError}</p>
        )}
      </Section>

      <Section
        icon={<IndianRupee className="h-5 w-5" />}
        title="Rental pricing"
        description="Set prices for each rental duration. Packages save renters money."
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50/70 px-3.5 py-3">
          <p className="text-[11px] text-brand-800">
            Tip: package prices are usually 40–60% cheaper per day than the daily
            rate.
          </p>
          <button
            type="button"
            onClick={autoFillPrices}
            className="btn-secondary btn-sm"
          >
            <Sparkles className="h-3.5 w-3.5" /> Auto-fill packages
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["dailyPrice", "Daily price", "Charged per day"],
            ["weeklyPrice", "Weekly package", "7-day rental"],
            ["monthlyPrice", "Monthly package", "30-day rental"],
            ["sixMonthPrice", "6-month package", "180-day rental"],
            ["yearlyPrice", "Yearly package", "365-day rental"],
            ["extraDayPrice", "Extra day price", "Beyond package"],
          ].map(([field, label, hint]) => (
            <div key={field}>
              <label className="label" htmlFor={field}>
                {label}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  ₹
                </span>
                <input
                  id={field}
                  type="number"
                  min={0}
                  className="input pl-7"
                  placeholder="0"
                  {...register(field as keyof ProductInput, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{hint}</p>
              {errors[field as keyof ProductInput] && (
                <p className="mt-1 text-[10px] text-rose-600">
                  {String(errors[field as keyof ProductInput]?.message)}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="securityDeposit">
              Refundable security deposit
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ₹
              </span>
              <input
                id="securityDeposit"
                type="number"
                min={0}
                className="input pl-7"
                placeholder="0"
                {...register("securityDeposit", { valueAsNumber: true })}
              />
            </div>
            {errors.securityDeposit && (
              <p className="mt-1 text-[10px] text-rose-600">
                {errors.securityDeposit.message}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
              <Info className="h-3 w-3" /> Estimated monthly earning
            </p>
            <p className="mt-1 font-display text-lg font-semibold text-ink">
              {formatINR((dailyPrice || 0) * 18)}
            </p>
            <p className="text-[9px] text-slate-400">
              If booked for a full month at your package price
            </p>
          </div>
        </div>
      </Section>

      <Section
        icon={<MapPin className="h-5 w-5" />}
        title="Location & availability"
        description="Renters use this to find items near them."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="city">
              City
            </label>
            <input
              id="city"
              list="city-options"
              className="input"
              placeholder="Mumbai"
              {...register("city")}
            />
            <datalist id="city-options">
              {CITIES.map((city) => (
                <option key={city} value={city} />
              ))}
            </datalist>
            {errors.city && (
              <p className="mt-1 text-xs text-rose-600">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="location">
              Area / locality
            </label>
            <input
              id="location"
              className="input"
              placeholder="Bandra West"
              {...register("location")}
            />
            {errors.location && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.location.message}
              </p>
            )}
          </div>
        </div>

        <label className="mt-4 flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 px-4 py-3">
          <div>
            <p className="text-xs font-semibold text-ink">Available for rent</p>
            <p className="text-[10px] text-slate-400">
              Turn this off to temporarily hide the listing from new bookings.
            </p>
          </div>
          <span className="relative inline-flex items-center">
            <input type="checkbox" {...register("isAvailable")} className="peer sr-only" />
            <span
              className={cn(
                "h-6 w-11 rounded-full transition",
                available ? "bg-brand-600" : "bg-slate-300",
              )}
            />
            <span
              className={cn(
                "absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                available && "translate-x-5",
              )}
            />
          </span>
        </label>
      </Section>

      {serverError && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {serverError}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <p className="rounded-xl bg-amber-50 px-3.5 py-2.5 text-[11px] text-amber-700">
          Some fields need attention. Scroll up to review the highlighted
          sections.
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[10px] text-slate-400">
          New and edited listings are reviewed by an admin before going live.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isSubmitting
              ? "Saving…"
              : initial
                ? "Save changes"
                : "Submit listing"}
          </button>
        </div>
      </div>
    </form>
  );
}