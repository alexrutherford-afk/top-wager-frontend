// ─────────────────────────────────────────────────────────────────────────────
// GEO CONFIG — Tobique Licence
// Blocked list covers all regulated markets Tobique cannot serve.
// Allowed list covers key target markets with per-country config.
// TODO: Backend — validate country server-side via IP on every session start.
// ─────────────────────────────────────────────────────────────────────────────

export type PaymentMethod = {
  id:       string;
  name:     string;
  icon:     string;
  type:     'card' | 'ewallet' | 'mobile_money' | 'bank' | 'crypto';
  minDep:   number;
  maxDep:   number;
  instant:  boolean;
};

export type CountryConfig = {
  code:           string;   // ISO 3166-1 alpha-2
  name:           string;
  flag:           string;
  currency:       string;
  currencySymbol: string;
  defaultLang:    'en' | 'sw' | 'fr';
  paymentMethods: PaymentMethod[];
  blocked:        false;
};

export type BlockedCountry = {
  code:    string;
  name:    string;
  blocked: true;
  reason:  string;
};

// ── Payment method library ────────────────────────────────────────────────────
const PM = {
  visa:        { id: 'visa',        name: 'Visa',           icon: '💳', type: 'card'         as const, minDep: 10,  maxDep: 5000, instant: true  },
  mastercard:  { id: 'mastercard',  name: 'Mastercard',     icon: '💳', type: 'card'         as const, minDep: 10,  maxDep: 5000, instant: true  },
  mpesa_ke:    { id: 'mpesa_ke',    name: 'M-Pesa',         icon: '📱', type: 'mobile_money' as const, minDep: 100, maxDep: 150000, instant: true },
  mpesa_tz:    { id: 'mpesa_tz',    name: 'M-Pesa',         icon: '📱', type: 'mobile_money' as const, minDep: 500, maxDep: 3000000, instant: true },
  airtel_ke:   { id: 'airtel_ke',   name: 'Airtel Money',   icon: '📱', type: 'mobile_money' as const, minDep: 100, maxDep: 70000,  instant: true },
  airtel_tz:   { id: 'airtel_tz',   name: 'Airtel Money',   icon: '📱', type: 'mobile_money' as const, minDep: 500, maxDep: 2000000,instant: true },
  mtn_gh:      { id: 'mtn_gh',      name: 'MTN MoMo',       icon: '📱', type: 'mobile_money' as const, minDep: 5,   maxDep: 5000,   instant: true },
  mtn_ng:      { id: 'mtn_ng',      name: 'MTN',            icon: '📱', type: 'mobile_money' as const, minDep: 500, maxDep: 500000, instant: true },
  opay:        { id: 'opay',        name: 'OPay',           icon: '📱', type: 'ewallet'      as const, minDep: 500, maxDep: 200000, instant: true },
  bank_ng:     { id: 'bank_ng',     name: 'Bank Transfer',  icon: '🏦', type: 'bank'         as const, minDep: 1000,maxDep: 1000000,instant: false },
  upi:         { id: 'upi',         name: 'UPI',            icon: '📱', type: 'ewallet'      as const, minDep: 100, maxDep: 100000, instant: true },
  netbanking:  { id: 'netbanking',  name: 'Net Banking',    icon: '🏦', type: 'bank'         as const, minDep: 100, maxDep: 200000, instant: false },
  interac:     { id: 'interac',     name: 'Interac',        icon: '🏦', type: 'bank'         as const, minDep: 10,  maxDep: 10000,  instant: true  },
  pix:         { id: 'pix',         name: 'PIX',            icon: '📱', type: 'ewallet'      as const, minDep: 20,  maxDep: 50000,  instant: true  },
  oxxo:        { id: 'oxxo',        name: 'OXXO',           icon: '🏪', type: 'bank'         as const, minDep: 100, maxDep: 10000,  instant: false },
  bank_za:     { id: 'bank_za',     name: 'EFT / Bank',     icon: '🏦', type: 'bank'         as const, minDep: 50,  maxDep: 50000,  instant: false },
  ozow:        { id: 'ozow',        name: 'Ozow',           icon: '📱', type: 'ewallet'      as const, minDep: 10,  maxDep: 10000,  instant: true  },
  crypto:      { id: 'crypto',      name: 'Crypto',         icon: '₿',  type: 'crypto'       as const, minDep: 10,  maxDep: 50000,  instant: true  },
  skrill:      { id: 'skrill',      name: 'Skrill',         icon: '💜', type: 'ewallet'      as const, minDep: 10,  maxDep: 10000,  instant: true  },
  neteller:    { id: 'neteller',    name: 'Neteller',       icon: '🔵', type: 'ewallet'      as const, minDep: 10,  maxDep: 10000,  instant: true  },
};

// ── Allowed countries ─────────────────────────────────────────────────────────
export const ALLOWED_COUNTRIES: CountryConfig[] = [
  // ── Africa ────────────────────────────────────────────────────────────────
  {
    code: 'KE', name: 'Kenya',         flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh',
    defaultLang: 'sw',
    blocked: false,
    paymentMethods: [PM.mpesa_ke, PM.airtel_ke, PM.visa, PM.mastercard, PM.crypto],
  },
  {
    code: 'TZ', name: 'Tanzania',      flag: '🇹🇿', currency: 'TZS', currencySymbol: 'TSh',
    defaultLang: 'sw',
    blocked: false,
    paymentMethods: [PM.mpesa_tz, PM.airtel_tz, PM.visa, PM.mastercard, PM.crypto],
  },
  {
    code: 'NG', name: 'Nigeria',       flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.opay, PM.bank_ng, PM.mtn_ng, PM.visa, PM.mastercard, PM.crypto],
  },
  {
    code: 'GH', name: 'Ghana',         flag: '🇬🇭', currency: 'GHS', currencySymbol: '₵',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.mtn_gh, PM.visa, PM.mastercard, PM.crypto],
  },
  {
    code: 'ZA', name: 'South Africa',  flag: '🇿🇦', currency: 'ZAR', currencySymbol: 'R',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.ozow, PM.bank_za, PM.visa, PM.mastercard, PM.skrill, PM.crypto],
  },
  {
    code: 'UG', name: 'Uganda',        flag: '🇺🇬', currency: 'UGX', currencySymbol: 'USh',
    defaultLang: 'sw',
    blocked: false,
    paymentMethods: [PM.airtel_ke, PM.visa, PM.mastercard, PM.crypto],
  },
  {
    code: 'RW', name: 'Rwanda',        flag: '🇷🇼', currency: 'RWF', currencySymbol: 'Fr',
    defaultLang: 'fr',
    blocked: false,
    paymentMethods: [PM.visa, PM.mastercard, PM.crypto],
  },
  {
    code: 'SN', name: 'Senegal',       flag: '🇸🇳', currency: 'XOF', currencySymbol: 'CFA',
    defaultLang: 'fr',
    blocked: false,
    paymentMethods: [PM.visa, PM.mastercard, PM.crypto],
  },
  {
    code: 'CI', name: 'Côte d\'Ivoire',flag: '🇨🇮', currency: 'XOF', currencySymbol: 'CFA',
    defaultLang: 'fr',
    blocked: false,
    paymentMethods: [PM.visa, PM.mastercard, PM.crypto],
  },
  {
    code: 'CM', name: 'Cameroon',      flag: '🇨🇲', currency: 'XAF', currencySymbol: 'CFA',
    defaultLang: 'fr',
    blocked: false,
    paymentMethods: [PM.visa, PM.mastercard, PM.crypto],
  },
  // ── Asia ──────────────────────────────────────────────────────────────────
  {
    code: 'IN', name: 'India',         flag: '🇮🇳', currency: 'INR', currencySymbol: '₹',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.upi, PM.netbanking, PM.visa, PM.mastercard, PM.skrill, PM.crypto],
  },
  {
    code: 'BD', name: 'Bangladesh',    flag: '🇧🇩', currency: 'BDT', currencySymbol: '৳',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.visa, PM.mastercard, PM.skrill, PM.crypto],
  },
  {
    code: 'PK', name: 'Pakistan',      flag: '🇵🇰', currency: 'PKR', currencySymbol: '₨',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.visa, PM.mastercard, PM.skrill, PM.crypto],
  },
  {
    code: 'JP', name: 'Japan',         flag: '🇯🇵', currency: 'JPY', currencySymbol: '¥',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.visa, PM.mastercard, PM.neteller, PM.crypto],
  },
  // ── Americas ──────────────────────────────────────────────────────────────
  {
    code: 'CA', name: 'Canada',        flag: '🇨🇦', currency: 'CAD', currencySymbol: 'C$',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.interac, PM.visa, PM.mastercard, PM.skrill, PM.neteller, PM.crypto],
  },
  {
    code: 'BR', name: 'Brazil',        flag: '🇧🇷', currency: 'BRL', currencySymbol: 'R$',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.pix, PM.visa, PM.mastercard, PM.skrill, PM.crypto],
  },
  {
    code: 'MX', name: 'Mexico',        flag: '🇲🇽', currency: 'MXN', currencySymbol: '$',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.oxxo, PM.visa, PM.mastercard, PM.skrill, PM.crypto],
  },
  // ── Rest of world (catch-all for unrecognised allowed countries) ──────────
  {
    code: 'OTHER', name: 'Other',      flag: '🌍', currency: 'USD', currencySymbol: '$',
    defaultLang: 'en',
    blocked: false,
    paymentMethods: [PM.visa, PM.mastercard, PM.skrill, PM.neteller, PM.crypto],
  },
];

// ── Blocked countries (Tobique cannot serve) ──────────────────────────────────
export const BLOCKED_COUNTRIES: BlockedCountry[] = [
  // EU regulated
  { code: 'GB', name: 'United Kingdom',  blocked: true, reason: 'UKGC licence required' },
  { code: 'DE', name: 'Germany',         blocked: true, reason: 'DSWV licence required' },
  { code: 'FR', name: 'France',          blocked: true, reason: 'ANJ licence required' },
  { code: 'NL', name: 'Netherlands',     blocked: true, reason: 'KSA licence required' },
  { code: 'SE', name: 'Sweden',          blocked: true, reason: 'Spelinspektionen licence required' },
  { code: 'DK', name: 'Denmark',         blocked: true, reason: 'Spillemyndighed licence required' },
  { code: 'IT', name: 'Italy',           blocked: true, reason: 'ADM licence required' },
  { code: 'ES', name: 'Spain',           blocked: true, reason: 'DGOJ licence required' },
  { code: 'PT', name: 'Portugal',        blocked: true, reason: 'SRIJ licence required' },
  { code: 'BE', name: 'Belgium',         blocked: true, reason: 'Gaming Commission required' },
  { code: 'RO', name: 'Romania',         blocked: true, reason: 'ONJN licence required' },
  { code: 'CZ', name: 'Czech Republic',  blocked: true, reason: 'Regulated market' },
  { code: 'PL', name: 'Poland',          blocked: true, reason: 'Regulated market' },
  { code: 'GR', name: 'Greece',          blocked: true, reason: 'Regulated market' },
  { code: 'AT', name: 'Austria',         blocked: true, reason: 'Regulated market' },
  { code: 'CH', name: 'Switzerland',     blocked: true, reason: 'Regulated market' },
  { code: 'FI', name: 'Finland',         blocked: true, reason: 'Regulated market' },
  { code: 'NO', name: 'Norway',          blocked: true, reason: 'Regulated market' },
  // Americas
  { code: 'US', name: 'United States',   blocked: true, reason: 'Unlicensed jurisdiction' },
  // Asia-Pacific
  { code: 'AU', name: 'Australia',       blocked: true, reason: 'ACMA licence required' },
  { code: 'SG', name: 'Singapore',       blocked: true, reason: 'MAS regulated' },
  { code: 'KR', name: 'South Korea',     blocked: true, reason: 'Regulated market' },
  { code: 'CN', name: 'China',           blocked: true, reason: 'Prohibited' },
  // Middle East
  { code: 'IR', name: 'Iran',            blocked: true, reason: 'Prohibited' },
  { code: 'IL', name: 'Israel',          blocked: true, reason: 'Regulated market' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
export function getCountryConfig(code: string): CountryConfig | BlockedCountry {
  const blocked = BLOCKED_COUNTRIES.find(c => c.code === code);
  if (blocked) return blocked;
  return ALLOWED_COUNTRIES.find(c => c.code === code)
    ?? ALLOWED_COUNTRIES.find(c => c.code === 'OTHER')!;
}

export function isBlocked(code: string): boolean {
  return BLOCKED_COUNTRIES.some(c => c.code === code);
}

export const ALL_SELECTABLE = ALLOWED_COUNTRIES.filter(c => c.code !== 'OTHER');
