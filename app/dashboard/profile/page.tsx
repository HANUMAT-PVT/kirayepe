import Link from "next/link";
import { CalendarDays, MapPin, Package, Star } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { averageRating, formatDate, formatINR } from "@/lib/utils";
import { Avatar } from "@/components/avatar";
import { Rating } from "@/components/rating";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();

  const [listingCount, bookingCount, reviews] = await Promise.all([
    db.product.count({ where: { sellerId: user.id } }),
    db.booking.count({ where: { renterId: user.id } }),
    db.review.findMany({
      where: { targetId: user.id },
      include: { author: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const rating = averageRating(reviews);

  return (
    <div>
      <div>
        <p className="section-eyebrow">Account</p>
        <h1 className="mt-1.5 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1.5 text-sm text-muted">
          Manage how you appear to other renters and owners.
        </p>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <ProfileForm
          email={user.email}
          defaultValues={{
            name: user.name,
            phone: user.phone ?? "",
            city: user.city ?? "",
            bio: user.bio ?? "",
            avatar: user.avatar ?? "",
          }}
        />

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-5 text-white">
            <div className="absolute inset-0 surface-grid opacity-20" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <Avatar name={user.name} src={user.avatar} size="lg" />
                <div>
                  <p className="font-display text-base font-semibold">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-white/50">
                    Member since {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Listings", value: listingCount, icon: Package },
                  { label: "Rentals", value: bookingCount, icon: CalendarDays },
                  { label: "Reviews", value: reviews.length, icon: Star },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center"
                  >
                    <stat.icon className="mx-auto h-3.5 w-3.5 text-brand-300" />
                    <p className="mt-1 font-display text-sm font-semibold">
                      {stat.value}
                    </p>
                    <p className="text-[9px] text-white/40">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5">
                <span className="flex items-center gap-1.5 text-[11px] text-white/60">
                  <MapPin className="h-3 w-3" /> {user.city ?? "Add your city"}
                </span>
                <Rating value={rating} />
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold text-ink">
                Reviews about you
              </h2>
              <Link
                href="/dashboard/rentals"
                className="text-[11px] font-semibold text-brand-700"
              >
                My rentals →
              </Link>
            </div>
            {reviews.length === 0 ? (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-4 text-[11px] text-slate-400">
                Reviews from owners and renters will appear here.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-slate-100 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar
                        name={review.author.name}
                        src={review.author.avatar}
                        size="xs"
                      />
                      <p className="text-[11px] font-semibold text-ink">
                        {review.author.name}
                      </p>
                      <span className="ml-auto flex">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-2.5 w-2.5 ${
                              index < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-200"
                            }`}
                          />
                        ))}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <p className="text-xs font-semibold text-brand-800">
              Trust tip
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-brand-700/80">
              Profiles with a photo, city and short bio get up to{" "}
              {formatINR(2400)} more rental interest in this demo dataset.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}