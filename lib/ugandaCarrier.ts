// ─────────────────────────────────────────────────────────────────────────────
// Uganda carrier detection
// Strips +256 / 256 country code (or leading 0) then matches the 3-digit
// prefix against known MTN and Airtel Uganda number ranges.
// ─────────────────────────────────────────────────────────────────────────────

export type UgandaCarrier = 'MTN' | 'Airtel';

const MTN_PREFIXES    = ['077', '078', '076', '039'];
const AIRTEL_PREFIXES = ['075', '070', '074', '073'];

export function detectUgandaCarrier(phone: string): UgandaCarrier | null {
  // Remove all spaces / dashes
  let n = phone.replace(/[\s\-]/g, '');

  // Strip international prefix
  if (n.startsWith('+256')) n = n.slice(4);
  else if (n.startsWith('256')) n = n.slice(3);

  // Normalise to local format with leading 0
  if (!n.startsWith('0')) n = '0' + n;

  const prefix = n.slice(0, 3);

  if (MTN_PREFIXES.includes(prefix))    return 'MTN';
  if (AIRTEL_PREFIXES.includes(prefix)) return 'Airtel';
  return null;
}
