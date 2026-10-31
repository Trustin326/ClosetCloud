# ClosetCloud launch checklist

## Development approach — external services deferred
- Build and exercise independent UI flows before connecting Supabase. The Outfit Studio currently uses browser-local storage and does not require Supabase credentials.
- Do not create or configure Supabase until the product is feature-complete enough for integrated sales-readiness testing. Before that point, keep the database schema and migrations versioned in the repository.
- Stripe, Cloudinary, production AI and deployment credentials are also later external setup steps; do not represent them as connected until tested with real accounts.

## Before public launch
- [ ] At sales-readiness stage, create a Supabase project and run every migration in `supabase/migrations/` in filename order.
- [ ] Configure Supabase Auth email confirmation, redirect URLs and allowed origins.
- [ ] Add all `.env.example` values to Vercel; keep secrets server-side.
- [ ] Configure Cloudinary and test signed uploads from a real authenticated session.
- [ ] Create Stripe products/prices; set environment variables; configure webhook signing secret.
- [ ] Confirm webhook events in Stripe dashboard and test successful, expired and refunded purchases.
- [ ] Add refund handling and subscription lifecycle handling before selling recurring creator access.
- [ ] Add terms, privacy notice, cookie notice if applicable, community rules, contact/support and refund policy.
- [ ] Add image moderation, abuse reporting review process, rate limiting and operational alerts.
- [ ] Test account creation, email confirmation, sign-in, closet CRUD, outfit CRUD, public visibility and access controls.
- [ ] Test follow/unfollow, like/unlike, public follower counts, comment creation and comment visibility using separate test accounts.
- [ ] Run accessibility checks, mobile browser checks, security review and end-to-end payment tests.
- [ ] Set production domain and `NEXT_PUBLIC_SITE_URL`.

## Current implementation boundaries
- Creator subscription checkout can start, but subscription renewal/cancellation entitlement synchronization is not implemented.
- One-time stylebook purchase is recorded, but gated digital download/product fulfillment is not implemented.
- Cloudinary signing endpoint exists; a complete client upload flow and asset ownership verification/registration are not included.
- Admin moderation interface and report-review workflow are not included; the database has reports and admin profile flags.
- Discovery now includes follow/unfollow, like/unlike and comment interactions. These require Supabase migrations and authenticated test accounts to verify end-to-end.
- Outfit builder saves selected closet item associations; a visual drag-and-drop canvas is not included.
- Automated end-to-end tests, full production security review and live payment verification remain outstanding.

Do not launch commercially until CI passes and the external services and test cases above have been verified.