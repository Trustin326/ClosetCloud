# ClosetCloud launch checklist

## Before public launch
- [ ] Create Supabase project and run `supabase/migrations/0001_initial_schema.sql`.
- [ ] Configure Supabase Auth email confirmation, redirect URLs and allowed origins.
- [ ] Add all `.env.example` values to Vercel; keep secrets server-side.
- [ ] Configure Cloudinary and test signed uploads from a real authenticated session.
- [ ] Create Stripe products/prices; set environment variables; configure webhook signing secret.
- [ ] Confirm webhook events in Stripe dashboard and test successful, expired and refunded purchases.
- [ ] Add refund handling and subscription lifecycle handling before selling recurring creator access.
- [ ] Add terms, privacy notice, cookie notice if applicable, community rules, contact/support and refund policy.
- [ ] Add image moderation, abuse reporting review process, rate limiting and operational alerts.
- [ ] Test account creation, email confirmation, sign-in, closet CRUD, outfit CRUD, public visibility and access controls.
- [ ] Run accessibility checks, mobile browser checks, security review and end-to-end payment tests.
- [ ] Set production domain and `NEXT_PUBLIC_SITE_URL`.

## Known implementation boundaries
- Creator subscription checkout can start, but subscription renewal/cancellation entitlement synchronization is not yet implemented.
- One-time stylebook purchase is recorded, but a gated digital download/product fulfillment flow is not included yet.
- Cloudinary signing endpoint returns a constrained user folder signature; client upload UI and asset ownership verification/registration are not included yet.
- Admin moderation interface is not included; schema supports reports and admin profile flags.
- Social schema and public discovery are present; follow/like/comment UI and APIs remain to be implemented.
- Outfit builder currently saves selected closet item associations; visual drag-and-drop canvas is not included in this release.
