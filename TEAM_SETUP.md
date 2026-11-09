# KirayePe — Team Setup & Demo Guide

Hand this file to any teammate. It contains everything needed to run KirayePe locally, seed the demo data, log in, demo every feature, and deploy.

---

## 1. What you need

| Requirement | Notes |
| --- | --- |
| Node.js 20.9+ | Node 22 LTS or 24 recommended. Check with `node -v` |
| npm | Comes with Node |
| Git | To clone the repository |
| MongoDB Atlas account/access | Ask the team lead for the `DATABASE_URL` |
| (Optional) Cloudinary account | Only needed for file uploads in production; local dev works without it |

No Docker, no local MongoDB install required.

---

## 2. Get the project

```bash
git clone <YOUR_REPO_URL> kirayepe
cd kirayepe
npm install
```

If you received a ZIP instead of a Git URL, unzip it and run `npm install` inside the folder.

---

## 3. Create the environment file

```bash
cp .env.example .env
```

Open `.env` and paste the team's Atlas URI. It must look like this:

```env
DATABASE_URL="mongodb+srv://hanumat:YOUR_DB_PASSWORD@cluster0.aqmtmxk.mongodb.net/kirayepe?retryWrites=true&w=majority"

AUTH_SECRET="paste-a-long-random-string-here"

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

- **Ask the team lead for the Atlas password** and replace `YOUR_DB_PASSWORD`.
- Generate your own `AUTH_SECRET` (any long random string):

```bash
openssl rand -base64 48
```

- `.env` is gitignored. Never commit it.
- Cloudinary can stay empty for local development. Uploaded images are then saved to `public/uploads`.

### Atlas access check

If the database connection times out:

1. Log in to MongoDB Atlas.
2. Go to **Network Access**.
3. Add your current IP, or `0.0.0.0/0` for the college demo.
4. Wait ~1 minute and retry.

---

## 4. Set up the database and demo data

Run these once:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

What they do:

| Command | Purpose |
| --- | --- |
| `prisma generate` | Builds the typed Prisma client |
| `prisma db push` | Creates collections + indexes in MongoDB |
| `npm run db:seed` | Deletes existing data and inserts the full demo dataset |

> Warning: `npm run db:seed` **wipes the database** and recreates it. Coordinate with the team before running it on the shared Atlas cluster.

Seeded data:

- 20 Indian users
- 10 categories
- 50 products
- 15 bookings in every status
- 10 conversations with 39 messages
- 24 reviews, wishlists and notifications

---

## 5. Start the app

```bash
npm run dev
```

Open **http://localhost:3000**.

If port 3000 is busy:

```bash
npm run dev -- -p 3001
```

Then open http://localhost:3001.

---

## 6. Demo logins

| Role | Email | Password | Use it for |
| --- | --- | --- | --- |
| Admin | `admin@kirayepe.com` | `KirayePe@123` | Admin dashboard, moderation |
| User | `user@kirayepe.com` | `KirayePe@123` | Booking, wishlist, chat, reviews |
| Seller | `seller@kirayepe.com` | `KirayePe@123` | Managing 13+ listings and bookings |

All 20 seeded accounts use the password `KirayePe@123`.

The login page also has **Admin / User / Seller** quick-fill buttons.

---

## 7. Suggested demo script (5–7 minutes)

### As the User (`user@kirayepe.com`)
1. Homepage → point out DB-backed featured, recent and popular products.
2. Search “Sony” and filter by category/city/price.
3. Open **Sony Alpha A7 III** → gallery, owner, ratings, duration selector.
4. Pick Weekly, choose dates, note the live calculation (rental + 5% fee + deposit).
5. Click **Book now** → demo checkout → pay (simulated) → booking confirmed.
6. Go to **Dashboard → My rentals** → show the new booking, cancel/review actions.
7. Open **Messages** → show seeded conversations and send a message.
8. Show **Wishlist**, **Profile**, **Settings** (change password works).

### As the Seller (`seller@kirayepe.com`)
1. **Dashboard → My listings** → views, bookings, earnings.
2. Show **Booking requests** → Confirm or Mark complete.
3. **Add product** → upload photos, auto-fill prices, submit → note “pending admin approval”.
4. **Messages** → reply to a customer.

### As the Admin (`admin@kirayepe.com`)
1. `/admin` → totals, demo GMV, area/pie/bar charts, recent registrations.
2. **Products** → filter Pending → approve or reject → the product goes live in search.
3. **Users** → search, suspend → that user can no longer log in.
4. **Bookings** → change a booking status, open the payment breakdown.

---

## 8. Feature checklist

- Auth: signup, login, logout, JWT httpOnly session, bcrypt hashing, suspension, role guards
- Homepage, search, category/city/condition/price filters, sorting, pagination
- Product details, gallery, rental calculator, booking, seller chat, reviews, similar products
- Demo checkout with explicit “simulated payment” labelling
- User dashboard: overview, rentals, listings, add/edit products, messages, wishlist, profile, settings
- Image upload with preview, cover selection and delete (Cloudinary or local)
- Admin: analytics charts, user management, product moderation, booking management
- MongoDB via Prisma with ObjectId relations and indexes

---

## 9. npm scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run build` | Production build + type-check |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run db:push` | Sync Prisma schema to MongoDB |
| `npm run db:seed` | Wipe + reseed demo data |
| `npm run db:setup` | `generate` + `push` + `seed` |
| `npm run db:clean` | Delete all collections |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:local` | Offline MongoDB replica set (no Atlas needed) |

---

## 10. Offline option (no Atlas)

If the internet or Atlas is unavailable:

1. In `.env`, set:

```env
DATABASE_URL="mongodb://127.0.0.1:27017/kirayepe?replicaSet=rs0"
```

2. In terminal A:

```bash
npm run db:local
```

Keep it running. First run downloads a MongoDB binary (~100 MB) into the npm cache.

3. In terminal B:

```bash
npx prisma db push
npm run db:seed
npm run dev
```

Data is stored in `.mongo-data/` and survives restarts. To stop, press `Ctrl+C` in terminal A.

---

## 11. Deploying to Vercel

1. Push the repo to GitHub.
2. Import it at vercel.com → **New Project**.
3. Add environment variables in **Project → Settings → Environment Variables**:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Atlas SRV URI |
| `AUTH_SECRET` | long random string |
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard |

4. **Cloudinary is required on Vercel.** The local fallback writes to `public/uploads`, which is read-only/ephemeral on Vercel, so uploads will fail without Cloudinary.
5. In Atlas → Network Access, allow Vercel IPs (`0.0.0.0/0` for the demo).
6. Deploy. If production is empty, run `npx prisma db push && npm run db:seed` locally against the same Atlas URI.

---

## 12. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `P2031: transactions require a replica set` | Use Atlas, or run `npm run db:local` (starts a replica set) |
| `Server selection timeout` / `ECONNREFUSED` | Atlas IP whitelist, wrong password, or no internet |
| `Environment variable not found: DATABASE_URL` | `.env` missing or server not restarted |
| `Cannot find module '@prisma/client'` | Run `npx prisma generate` |
| Login says “account suspended” | Admin suspended the demo account; reactivate in `/admin/users` |
| Upload fails locally | Ensure `public/uploads` is writable; check file is JPG/PNG/WebP/AVIF under 5MB |
| Upload fails on Vercel | Add Cloudinary env vars |
| Images from Unsplash not loading | Internet required for seeded remote images |
| Port 3000 in use | `npm run dev -- -p 3001` |
| Build fails after schema edits | `npx prisma generate && npm run build` |
| Need a fresh demo | `npm run db:seed` (this deletes existing data) |

---

## 13. Project structure (where to look)

```
app/
  (site)/               public pages: home, products, checkout
  (auth)/               login, signup
  dashboard/            user workspace
  admin/                admin console
  api/                  all backend route handlers
components/             UI (cards, charts, forms, sidebars, chat)
lib/
  db.ts                 Prisma client
  auth.ts               JWT session + role guards
  pricing.ts            rental calculation
  validation.ts         Zod schemas
  constants.ts          statuses, durations, fees
prisma/
  schema.prisma         database models
  seed.ts               demo data
scripts/
  mongo-server.ts       offline MongoDB replica set
```

---

## 14. Ground rules for the team

- Do not commit `.env` or share the Atlas password in the repo.
- Do not run `npm run db:seed` while someone is demoing; it deletes their data.
- Treat all payments as simulated — never enter real card details.
- If two people edit the same Atlas data, changes are shared instantly. Use separate databases (different `DATABASE_URL` db names) if you need isolation.
- Ask before changing the Prisma schema on the shared database; run `npx prisma db push` only after coordinating.

---

## 15. One-command reminder

```bash
npm install && npx prisma generate && npx prisma db push && npm run db:seed && npm run dev
```

Then open http://localhost:3000 and sign in with `admin@kirayepe.com` / `KirayePe@123`.
