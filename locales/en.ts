const en = {
  // Nav
  nav_home:        'Home',
  nav_slots:       'Slots',
  nav_live:        'Live',
  nav_crash:       'Crash',
  nav_jackpots:    'Jackpots',
  nav_promos:      'Promos',
  nav_login:       'Login',
  nav_join:        'Join Free',
  nav_deposit:     'Deposit',
  nav_withdraw:    'Withdraw',
  nav_balance_main:  'Main',
  nav_balance_bonus: 'Bonus',

  // Auth
  login_title:       'Welcome back',
  login_subtitle:    'Sign in to your TopWager account',
  login_email:       'Email address',
  login_password:    'Password',
  login_forgot:      'Forgot password?',
  login_submit:      'Sign in',
  login_submitting:  'Signing in…',
  login_no_account:  "Don't have an account?",
  login_register:    'Register free',
  login_error_creds: 'Incorrect email or password.',

  register_title:    'Create account',
  register_subtitle: 'Join TopWager and claim your welcome bonus',
  register_submit:   'Create account',
  register_creating: 'Creating…',
  register_have_account: 'Already have an account?',
  register_signin:   'Sign in',

  // Wallet
  wallet_deposit:     'Deposit',
  wallet_withdraw:    'Withdraw',
  wallet_transactions:'Transactions',
  wallet_balance:     'Balance',
  wallet_cash:        'Cash',
  wallet_bonus:       'Bonus',
  wallet_pending:     'Pending',
  wallet_select_method: 'Select payment method',
  wallet_enter_amount:  'Enter amount',
  wallet_confirm:       'Confirm',
  wallet_success_dep:   'Deposit successful!',
  wallet_success_with:  'Withdrawal requested!',
  wallet_min:           'Min',
  wallet_max:           'Max',
  wallet_processing:    'Processing…',

  // Lobby
  lobby_welcome:       'Welcome back',
  lobby_featured:      'Featured Games',
  lobby_live_casino:   'Live Casino',
  lobby_jackpots:      'Jackpots',
  lobby_see_all:       'See all →',
  lobby_play:          'Play',
  lobby_new:           'NEW',
  lobby_hot:           'HOT',

  // Bonuses
  bonus_title:         'Bonuses & Promotions',
  bonus_active:        'Active Bonuses',
  bonus_available:     'Available Offers',
  bonus_claim:         'Claim Now',
  bonus_wagering:      'Wagering',
  bonus_expires:       'Expires',

  // Account
  account_profile:     'Profile',
  account_security:    'Security',
  account_rg:          'Resp. Gambling',
  account_save:        'Save changes',
  account_saved:       '✓ Saved',
  account_signout:     'Sign out',

  // Geo
  geo_blocked_title:   'Not available in your region',
  geo_blocked_body:    'TopWager is not available in your country due to licensing restrictions.',
  geo_blocked_support: 'If you believe this is an error, contact support.',
  geo_select_country:  'Select country',
  geo_wrong_country:   'Not your country?',

  // Language
  lang_en: 'English',
  lang_sw: 'Swahili',
  lang_fr: 'French',

  // RG
  rg_tagline: '18+ · Gamble Responsibly · BeGambleAware.org',
};

export default en;
export type TranslationKey = keyof typeof en;
