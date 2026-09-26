function readEnvFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === '') return defaultValue
  const normalized = value.trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false
  return defaultValue
}

/** Follow + DM screen. Keep in sync with the API env of the same name. */
export function isInstagramVerificationEnabled(): boolean {
  return readEnvFlag(
    import.meta.env.VITE_INFLUENCER_INSTAGRAM_VERIFICATION_ENABLED,
    false,
  )
}

/** Admin approval before sending offers. Keep in sync with the API env of the same name. */
export function isInfluencerAdminApprovalRequired(): boolean {
  return readEnvFlag(
    import.meta.env.VITE_INFLUENCER_ADMIN_APPROVAL_REQUIRED,
    false,
  )
}

/** Brand explore and campaign invites. Keep in sync with the API env of the same name. */
export function isBrandInfluencerDiscoveryEnabled(): boolean {
  return readEnvFlag(
    import.meta.env.VITE_BRAND_INFLUENCER_DISCOVERY_ENABLED,
    false,
  )
}
