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
| `/app/profile` | View profile |
| `/app/profile/edit` | Edit profile |

## Notes

- Brand onboarding requires name + category + city (goal / business size optional).
- Profile `PATCH /v1/users/me` accepts name, category, city, website, goal, businessSize (null clears optional fields).
- PWA manifest placeholders are in `public/manifest.webmanifest`; install prompt is phase 2.
