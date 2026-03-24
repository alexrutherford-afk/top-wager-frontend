import { TranslationKey } from './en';

const fr: Record<TranslationKey, string> = {
  // Nav
  nav_home:        'Accueil',
  nav_slots:       'Machines',
  nav_live:        'Casino Live',
  nav_crash:       'Crash',
  nav_jackpots:    'Jackpots',
  nav_promos:      'Promos',
  nav_login:       'Connexion',
  nav_join:        'Inscription',
  nav_deposit:     'Dépôt',
  nav_withdraw:    'Retrait',
  nav_balance_main:  'Solde',
  nav_balance_bonus: 'Bonus',

  // Auth
  login_title:       'Bon retour',
  login_subtitle:    'Connectez-vous à votre compte TopWager',
  login_email:       'Adresse e-mail',
  login_password:    'Mot de passe',
  login_forgot:      'Mot de passe oublié ?',
  login_submit:      'Connexion',
  login_submitting:  'Connexion…',
  login_no_account:  "Pas encore de compte ?",
  login_register:    "S'inscrire gratuitement",
  login_error_creds: 'Email ou mot de passe incorrect.',

  register_title:    'Créer un compte',
  register_subtitle: 'Rejoignez TopWager et réclamez votre bonus de bienvenue',
  register_submit:   'Créer un compte',
  register_creating: 'Création…',
  register_have_account: 'Vous avez déjà un compte ?',
  register_signin:   'Se connecter',

  // Wallet
  wallet_deposit:      'Dépôt',
  wallet_withdraw:     'Retrait',
  wallet_transactions: 'Transactions',
  wallet_balance:      'Solde',
  wallet_cash:         'Espèces',
  wallet_bonus:        'Bonus',
  wallet_pending:      'En attente',
  wallet_select_method:'Choisir un moyen de paiement',
  wallet_enter_amount: 'Saisir le montant',
  wallet_confirm:      'Confirmer',
  wallet_success_dep:  'Dépôt réussi !',
  wallet_success_with: 'Retrait demandé !',
  wallet_min:          'Min',
  wallet_max:          'Max',
  wallet_processing:   'Traitement…',

  // Lobby
  lobby_welcome:     'Bon retour',
  lobby_featured:    'Jeux à la une',
  lobby_live_casino: 'Casino en direct',
  lobby_jackpots:    'Jackpots',
  lobby_see_all:     'Voir tout →',
  lobby_play:        'Jouer',
  lobby_new:         'NOUVEAU',
  lobby_hot:         'POPULAIRE',

  // Bonuses
  bonus_title:     'Bonus et Promotions',
  bonus_active:    'Bonus actifs',
  bonus_available: 'Offres disponibles',
  bonus_claim:     'Réclamer maintenant',
  bonus_wagering:  'Mise requise',
  bonus_expires:   'Expire le',

  // Account
  account_profile:  'Profil',
  account_security: 'Sécurité',
  account_rg:       'Jeu Responsable',
  account_save:     'Enregistrer',
  account_saved:    '✓ Enregistré',
  account_signout:  'Déconnexion',

  // Geo
  geo_blocked_title:   'Non disponible dans votre région',
  geo_blocked_body:    "TopWager n'est pas disponible dans votre pays en raison de restrictions de licence.",
  geo_blocked_support: "Si vous pensez qu'il s'agit d'une erreur, contactez le support.",
  geo_select_country:  'Sélectionner un pays',
  geo_wrong_country:   "Ce n'est pas votre pays ?",

  // Language
  lang_en: 'Anglais',
  lang_sw: 'Swahili',
  lang_fr: 'Français',

  // RG
  rg_tagline: '18+ · Jouez Responsablement · BeGambleAware.org',
};

export default fr;
