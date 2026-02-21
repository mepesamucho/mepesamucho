/**
 * sessionManager.ts — Centralized session state control for mepesamucho.com
 * FASE 1: Sistema de robustez y control de sesión
 *
 * All localStorage/sessionStorage keys used by the app, with safe reset functions.
 * Preserves user preferences (text size) and active payment passes on reset.
 */

// ─── Key Registry ───────────────────────────────────────────────────────────

/** All localStorage keys used by the app */
export const LOCAL_KEYS = [
  "mpm_usos",              // daily usage count + date
  "mpm_daypass",           // day pass expiration timestamp
  "mpm_single",            // single-use pass for today
  "mpm_checkout_pending",  // pending Stripe checkout info
  "mpm_payment_success",   // successful payment recovery data
  "mpm_textsize",          // user text size preference
  "mpm_continuacion",      // continuation essay data (temp)
] as const;

/** All sessionStorage keys used by the app */
export const SESSION_KEYS = [
  "mpm_checkout_pending",  // mirror of localStorage version
  "mpm_payment_pending",   // session_id + type during verification
  "mpm_texto",             // original user text (first 2000 chars)
  "mpm_continuacion",      // continuation data (temp)
] as const;

/** Keys that should survive a user-initiated reset (preferences + active payments) */
const PRESERVE_ON_RESET: string[] = [
  "mpm_textsize",
  "mpm_daypass",
  "mpm_single",
];

/** Keys that represent active payment state */
const PAYMENT_KEYS: string[] = [
  "mpm_daypass",
  "mpm_single",
  "mpm_payment_success",
];

// ─── Reset Functions ────────────────────────────────────────────────────────

/**
 * Reset all session state except user preferences and active payment passes.
 * Use for "Empezar de nuevo" — clears the current reflection flow
 * but keeps text size, day pass, and single pass intact.
 */
export function resetSession(): void {
  // Clear localStorage keys (except preserved ones)
  for (const key of LOCAL_KEYS) {
    if (!PRESERVE_ON_RESET.includes(key)) {
      try { localStorage.removeItem(key); } catch {}
    }
  }

  // Clear all sessionStorage keys
  for (const key of SESSION_KEYS) {
    try { sessionStorage.removeItem(key); } catch {}
  }
}

/**
 * Full reset + navigate to home.
 * Calls resetSession() then reloads the page at root.
 */
export function resetAndGoHome(): void {
  resetSession();
  window.location.href = "/";
}

/**
 * Auto-reset for unpaid sessions returning after navigation away.
 * Clears reflection/session data but preserves ALL payment state
 * and user preferences. Called on page load when no active paid session.
 *
 * Only clears: mpm_usos (usage count stays — it's per-day),
 * mpm_checkout_pending, mpm_continuacion, mpm_texto, mpm_payment_pending.
 */
export function resetUnpaidSession(): void {
  const UNPAID_CLEAR_LOCAL: string[] = [
    "mpm_checkout_pending",
    "mpm_continuacion",
  ];
  const UNPAID_CLEAR_SESSION: string[] = [
    "mpm_checkout_pending",
    "mpm_payment_pending",
    "mpm_texto",
    "mpm_continuacion",
  ];

  for (const key of UNPAID_CLEAR_LOCAL) {
    try { localStorage.removeItem(key); } catch {}
  }
  for (const key of UNPAID_CLEAR_SESSION) {
    try { sessionStorage.removeItem(key); } catch {}
  }
}

/**
 * Check if user has any active paid access (day pass or single pass).
 */
export function hasActivePaidAccess(): boolean {
  try {
    // Check day pass
    const dp = localStorage.getItem("mpm_daypass");
    if (dp) {
      const parsed = JSON.parse(dp);
      if (parsed.expires && parsed.expires > Date.now()) return true;
    }
  } catch {}

  try {
    // Check single pass
    const sp = localStorage.getItem("mpm_single");
    if (sp) {
      const parsed = JSON.parse(sp);
      const today = new Date().toISOString().split("T")[0];
      if (parsed.date === today && parsed.available) return true;
    }
  } catch {}

  return false;
}
