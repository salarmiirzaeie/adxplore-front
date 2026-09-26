/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_FIREBASE_API_KEY?: string
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string
  readonly VITE_FIREBASE_PROJECT_ID?: string
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string
  readonly VITE_FIREBASE_APP_ID?: string
  readonly VITE_FIREBASE_VAPID_KEY?: string
  /** `true` shows follow + DM. `false` or unset skips it. Match the API flag. */
  readonly VITE_INFLUENCER_INSTAGRAM_VERIFICATION_ENABLED?: string
  /** `true` waits for admin approval. `false` or unset treats the account as approved. */
  readonly VITE_INFLUENCER_ADMIN_APPROVAL_REQUIRED?: string
  /** `true` shows brand influencer explore and campaign invites. `false` or unset hides both. */
  readonly VITE_BRAND_INFLUENCER_DISCOVERY_ENABLED?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
