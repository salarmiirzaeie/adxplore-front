# AdXplore Panel (ادکسپلور)

Iranian DIY Instagram influencer marketplace — web panel MVP.

- App: https://app.adxplore.ir (local: http://localhost:5173)
- API: http://localhost:3000 (`/v1`)

## Stack

Vite · React 19 · TypeScript · React Router · TanStack Query · Axios · Zod · RHF · Tailwind CSS v4

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Ensure the API is running on port 3000.

## MVP routes

| Route | Description |
|-------|-------------|
| `/login` | Phone → SMS OTP request |
| `/login/otp` | 5-digit OTP verify |
| `/onboarding` | Brand: 3-step profile · Influencer: display name |
| `/app` | Dashboard |
| `/app/campaigns` | Brand: my campaigns · Influencer: browse OPEN campaigns |
| `/app/campaigns/new` | Create campaign → invite influencers popup (brand) |
| `/app/campaigns/:id` | Campaign detail (brand manage/offers · influencer offer CTA) |
| `/app/invitations` | Influencer invitations inbox |
| `/app/invitations/:id` | Invitation detail · send offer |
| `/app/offers` | Influencer: my sent offers · Brand: received (via links/notifications) |
| `/app/offers/new` | Send offer to any OPEN campaign (influencer) |
| `/app/offers/:id` | Offer detail |
| `/app/deals` | Active collaborations (post-accept) |
| `/app/deals/:id` | Submit deliverable · confirm / request revision |
| `/app/notifications` | In-app notifications |
| `/app/profile` | View profile |
| `/app/profile/edit` | Edit profile |

## Notes

- Brand nav: dashboard · my campaigns · deals · profile (+ notifications).
- Influencer nav: dashboard · campaigns · invites · offers · deals · profile (+ notifications).
- Influencers can offer on any OPEN campaign (invite not required). Invites are an extra discovery channel.
- After creating an OPEN campaign, brand gets an invite-influencers popup.
- Accepting an offer creates a Deal (`IN_PROGRESS` → deliverable → brand confirm/revision → `COMPLETED`).
- PWA manifest placeholders are in `public/manifest.webmanifest`; install prompt is phase 2.
