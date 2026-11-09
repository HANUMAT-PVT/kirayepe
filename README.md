# KirayePe — Don't Buy It. Rent It.

> New here? Read **[PROJECT_GUIDE.md](./PROJECT_GUIDE.md)** for what the app does and how every flow works, and **[TEAM_SETUP.md](./TEAM_SETUP.md)** for copy-paste setup, demo script and troubleshooting.

A complete rental marketplace built as a college project with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**, **MongoDB**, **Prisma**, **React Hook Form + Zod**, **bcrypt/JWT auth**, **Cloudinary-ready uploads**, **Lucide icons** and **Recharts** analytics.

Users rent products from other users by the day, week, month, six months or year. Sellers list products, manage bookings, chat with renters and earn. Admins moderate the whole platform.

---

## 1. Quick start

```bash
# 1) install
npm install

# 2) environment is already configured in .env (MongoDB Atlas is active)

# 3) create collections + seed demo data (skip if already seeded)
npx prisma db push
npm run db:seed

# 4) run the app
npm run dev               # http://localhost:3000

# Optional: run fully offline with a bundled MongoDB instead of Atlas:
# npm run db:local        # keep running in its own terminal
# then set DATABASE_URL="mongodb://127.0.0.1:27017/kirayepe?replicaSet=rs0" in .env
# and run: npx prisma db push && npm run db:seed
```

### Using MongoDB Atlas instead of local

Set `DATABASE_URL` in `.env` to your Atlas connection string, then run:

```bash
npx prisma db push
npm run db:seed
npm run dev
```

Example:

```
DATABASE_URL="mongodb+srv://hanumat:<YOUR_REAL_PASSWORD>@cluster0.aqmtmxk.mongodb.net/kirayepe?retryWrites=true&w=majority"
```

Then whitelist your IP in Atlas → Network Access. No replica-set flags are needed for Atlas (it is a replica set already). The bundled `npm run db:local` script uses `mongodb-memory-server` on port 27017 with `replicaSet=rs0`, which is what `.env` points to by default so the project runs offline.

### Cloudinary (optional)

Image uploads work out of the box and save to `public/uploads`. To store them in Cloudinary instead, fill in:

```
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

Uploads automatically switch to Cloudinary when all three are present.

---

## 2. Demo credentials

| Role  | Email                 | Password      |
| ----- | --------------------- | ------------- |
| Admin | admin@kirayepe.com    | `KirayePe@123` |
| User  | user@kirayepe.com     | `KirayePe@123` |
| Seller| seller@kirayepe.com   | `KirayePe@123` |

All 20 seeded users share the same demo password. The login page has one-click buttons to fill these in.

**All payments are simulated.** No card details are collected and no money moves.

---

## 3. Scripts

| Script              | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `npm run dev`       | Start Next.js dev server                                  |
| `npm run build`     | Production build (type-checks + compiles)                 |
| `npm run start`     | Serve the production build                                |
| `npm run db:local`  | Local MongoDB replica set on `127.0.0.1:27017`            |
| `npm run db:push`   | Push Prisma schema to MongoDB                             |
| `npm run db:seed`   | Wipe + reseed all demo data                               |
| `npm run db:setup`  | `generate` + `db push` + `seed`                           |
| `npm run db:clean`  | Drop all collections and data                             |
| `npm run db:studio` | Prisma Studio GUI                                         |
| `npm run lint`      | ESLint                                                    |
| `npm run typecheck` | `tsc --noEmit`                                            |

---

## 4. Seed data

- 20 realistic Indian users (incl. admin, demo user, demo seller)
- 10 categories with cover images
- 50 products across all categories (49 approved/live, plus pending and rejected examples for moderation demos)
- 15 bookings spanning completed, active, confirmed, pending and cancelled
- 10 conversations with 39 messages
- 24 product reviews
- 8 wishlist entries and in-app notifications

---

## 5. Implemented features

### Public
- Premium homepage: hero ("Don't Buy It. Rent It."), DB-backed search, category filters, featured/recent/popular product rails, how-it-works, become-a-seller, trust section, footer.
- Product discovery: keyword search, category, city, condition, price range, sorting (newest / popular / price), pagination, filter chips, wishlist hearts.
- Product details: image gallery with thumbnails, per-duration price table, condition, owner card with ratings, location, availability, live rental calculator (dates + duration → rental, platform fee 5%, deposit, total), Book now, Chat with seller, verified-purchase reviews, similar products.
- Demo checkout: product summary, dates, duration, rental amount, platform fee, security deposit, total, UPI/card/netbanking demo selector, explicit "simulated payment" labelling.
- Auth: signup, login, logout, JWT session in an httpOnly cookie, bcrypt hashing, suspension checks, server-side role guards.

### User dashboard
- Overview: stats, spend/earnings, next rental, recent bookings, messages, notifications, profile completeness, quick actions.
- My rentals: status tabs with counts, booking cards, cancel booking, review CTA.
- My listings: seller stats, incoming booking requests with confirm/complete/cancel actions, status tabs, edit/delete, availability and pricing.
- Add/edit product: full form with React Hook Form + Zod, multi-image upload (Cloudinary or local), previews, cover selection, delete, image-URL fallback, auto-fill package pricing, availability toggle.
- Messages: conversation list with unread badges, per-product threads, timestamps, send/receive persisted in MongoDB, Enter-to-send, auto-scroll.
- Wishlist, Profile (avatar upload, bio, city, phone, review cards), Settings (notification toggles, password change, session info).

### Admin (`/admin`)
- Overview: total users, products, bookings, active rentals, demo GMV, 6-month GMV area chart, category pie chart, booking-status bar chart, recent registrations, recent bookings.
- Users: search by name/email/city, role tabs, suspend/activate (admins protected), user detail page with listings, bookings and stats.
- Products: search, status tabs, approve/reject/remove, feature/unfeature, seller links.
- Bookings: search, status filter, GMV counters, inline status updates, booking detail page with renter/seller and payment breakdown.
- Premium dark sidebar, tables, filters and responsive layout.

### API routes
`/api/auth/*`, `/api/products`, `/api/products/[id]`, `/api/bookings`, `/api/bookings/[id]`, `/api/conversations`, `/api/conversations/[id]/messages`, `/api/reviews`, `/api/wishlist`, `/api/profile`, `/api/profile/password`, `/api/upload`, `/api/admin/users/[id]`, `/api/admin/products/[id]`, `/api/admin/bookings/[id]`. Every mutating route re-checks the session and ownership/role server-side.

### Database (Prisma + MongoDB)
`User`, `Category`, `Product`, `Booking`, `Conversation`, `Message`, `Review`, `Wishlist`, `Notification` — with ObjectId relations, unique constraints (email, category slug, wishlist pair, conversation triple) and indexes on foreign keys, status, city, dates and role.

---

## 6. Design

White and light-grey canvas, dark ink typography, purple accent (`#7c3aed`), Inter body + Poppins headings, rounded cards, soft shadows, hover lift, gradient mesh hero, animated highlights, fully responsive layouts and premium dashboards.

---

## 7. Known limitations

- Payments are simulated by design; no gateway integration.
- Messaging is polling-free (refresh/select to fetch) — deliberately simple, no websockets.
- Notification preferences in Settings are UI-only (session state).
- Email verification, password reset and 2FA are out of scope for the demo.
- Reviews require a prior non-cancelled booking of that product, and are limited to one per user per product.
- If Cloudinary env vars are absent, uploads go to `public/uploads` (not persisted across deployments).
- Local dev uses `mongodb-memory-server`; data persists in `.mongo-data` but is disposable. Atlas is recommended for a live demo.

---

## 8. Project structure

```
app/
  (auth)/login, signup        # split-screen auth pages
  (site)/                     # public shell (header + footer)
    page.tsx                  # homepage
    products/                 # listing + [id] details
    checkout/[id]/            # demo checkout
  dashboard/                  # user workspace
    rentals, listings, listings/new, listings/[id]/edit,
    messages, wishlist, profile, settings
  admin/                      # admin console
    users, users/[id], products, bookings, bookings/[id]
  api/                        # route handlers
components/
  admin/, dashboard/, products/, checkout/, auth/
  product-card, site-header, site-footer, ui primitives
lib/
  db.ts, auth.ts, validation.ts, pricing.ts, constants.ts,
  product-query.ts, utils.ts
prisma/
  schema.prisma, seed.ts
scripts/
  mongo-server.ts             # local MongoDB replica set
```