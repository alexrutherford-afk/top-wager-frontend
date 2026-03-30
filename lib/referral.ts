/**
 * Referral code cookie helpers.
 * Cookie name: ref_code
 * Expiry:      30 days
 * Rules:       Set once — never overwrite an existing value.
 */

const COOKIE_NAME = 'ref_code';
const EXPIRY_DAYS = 30;

/** Read the current ref_code cookie value, or null if not set. */
export function getRefCodeCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

/**
 * Set the ref_code cookie.
 * No-op if a value already exists (first-touch attribution).
 */
export function setRefCodeCookie(code: string): void {
  if (typeof document === 'undefined') return;
  if (getRefCodeCookie()) return; // never overwrite

  const expires = new Date();
  expires.setDate(expires.getDate() + EXPIRY_DAYS);

  document.cookie = [
    `${COOKIE_NAME}=${encodeURIComponent(code)}`,
    `expires=${expires.toUTCString()}`,
    'path=/',
    'SameSite=Lax',
  ].join('; ');
}
