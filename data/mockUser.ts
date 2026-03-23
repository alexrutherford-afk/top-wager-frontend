export const MOCK_USER = {
  id: 'usr_001',
  firstName: 'Alex',
  lastName: 'Rutherford',
  email: 'alex@example.com',
  username: 'alex_r',
  currency: 'EUR',
  balance: {
    cash: 1240.5,
    bonus: 350.0,
    pending: 200.0,
  },
  kycStatus: 'verified' as const, // 'unverified' | 'pending' | 'verified'
  accountStatus: 'active' as const,
  memberSince: '2024-03-01',
  vipLevel: 'Gold',
  wageredTotal: 48_320,
};

export const MOCK_TRANSACTIONS = [
  { id: 'tx_1', type: 'deposit' as const, method: 'Visa •••• 4242', amount: 200, currency: 'EUR', status: 'completed' as const, date: '2026-03-19T14:32:00Z' },
  { id: 'tx_2', type: 'withdrawal' as const, method: 'Bank Transfer', amount: -150, currency: 'EUR', status: 'pending' as const, date: '2026-03-18T10:15:00Z' },
  { id: 'tx_3', type: 'bonus' as const, method: 'Welcome Bonus', amount: 100, currency: 'EUR', status: 'completed' as const, date: '2026-03-17T09:00:00Z' },
  { id: 'tx_4', type: 'deposit' as const, method: 'Apple Pay', amount: 500, currency: 'EUR', status: 'completed' as const, date: '2026-03-15T18:44:00Z' },
  { id: 'tx_5', type: 'withdrawal' as const, method: 'Visa •••• 4242', amount: -300, currency: 'EUR', status: 'completed' as const, date: '2026-03-12T11:20:00Z' },
  { id: 'tx_6', type: 'deposit' as const, method: 'Mastercard •••• 1234', amount: 100, currency: 'EUR', status: 'completed' as const, date: '2026-03-10T16:08:00Z' },
];

export const MOCK_BONUSES = [
  {
    id: 'bon_1',
    title: 'Welcome Package',
    description: '100% match up to €500 + 50 Free Spins',
    type: 'deposit_match' as const,
    status: 'active' as const,
    bonusAmount: 350,
    wageredAmount: 1400,
    wageringRequirement: 4200, // 12x the bonus
    expiresAt: '2026-04-19T23:59:00Z',
    game: 'Gates of Olympus',
  },
  {
    id: 'bon_2',
    title: 'Weekly Reload',
    description: '50% match up to €200 every Monday',
    type: 'reload' as const,
    status: 'available' as const,
    bonusAmount: 0,
    wageredAmount: 0,
    wageringRequirement: 0,
    expiresAt: '2026-03-24T23:59:00Z',
    game: null,
  },
  {
    id: 'bon_3',
    title: 'Free Spins Tuesday',
    description: '20 Free Spins on Book of Dead',
    type: 'free_spins' as const,
    status: 'available' as const,
    bonusAmount: 0,
    wageredAmount: 0,
    wageringRequirement: 0,
    expiresAt: '2026-03-25T23:59:00Z',
    game: 'Book of Dead',
  },
  {
    id: 'bon_4',
    title: 'Cashback Offer',
    description: '10% cashback on net losses up to €100',
    type: 'cashback' as const,
    status: 'expired' as const,
    bonusAmount: 42,
    wageredAmount: 42,
    wageringRequirement: 42,
    expiresAt: '2026-03-10T23:59:00Z',
    game: null,
  },
];

export const PAYMENT_METHODS = [
  { id: 'pm_visa', label: 'Visa', icon: '💳', last4: '4242', type: 'card' as const },
  { id: 'pm_mc', label: 'Mastercard', icon: '💳', last4: '1234', type: 'card' as const },
  { id: 'pm_apple', label: 'Apple Pay', icon: '🍎', last4: null, type: 'wallet' as const },
  { id: 'pm_bank', label: 'Bank Transfer', icon: '🏦', last4: null, type: 'bank' as const },
];
