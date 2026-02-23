/**
 * sessionManager.ts — Centralized session state control for mepesamucho.com
 * FASE 1: Sistema de robustez y control de sesión
 *
 * Categories:
 *   A) PERSIST_ALWAYS  — UI preferences (survive everything)
 *   B) PERSIST_ACCESS  — code/email (survive softReset, cleared on hardReset)
 *   C) PERSIST_LIMIT   — free usage counter (survive softReset, cleared on hardReset)
 *   D) SESSION/CONTENT — everything else (cleared on any reset)
 */

// ─── Persist Sets ───────────────────────────────────────────────────────────

const PERSIST_ALWAYS = ["mpm_textsize"];
const PERSIST_ACCESS = ["mpm_code", "mpm_email"];
const PERSIST_LIMIT  = ["mpm_daily_session"];

// ─── All Known Keys ─────────────────────────────────────────────────────────

/** Every localStorage key the app may write */
const ALL_LOCAL_KEYS = [
  "mpm_usos",
  "mpm_daypass",
  "mpm_single",
  "mpm_checkout_pending",
  "mpm_payment_success",
  "mpm_textsize",
  "mpm_continuacion",
  "mpm_daily_session",
  "mpm_code",
  "mpm_email",
];

/** Every sessionStorage key the app may write */
const ALL_SESSION_KEYS = [
  "mpm_checkout_pending",
  "mpm_payment_pending",
  "mpm_payment_confirmed",
  "mpm_texto",
  "mpm_continuacion",
];

// ─── Reset Functions ────────────────────────────────────────────────────────

/**
 * softReset — "Empezar de nuevo"
 *
 * Clears all session/content/checkout state.
 * Preserves: mpm_textsize, mpm_code, mpm_email, mpm_daily_session.
 *
 * Does NOT navigate — caller handles navigation.
 */
export function softReset(): void {
  const preserve = new Set([...PERSIST_ALWAYS, ...PERSIST_ACCESS, ...PERSIST_LIMIT]);

  for (const key of ALL_LOCAL_KEYS) {
    if (!preserve.has(key)) {
      try { localStorage.removeItem(key); } catch {}
    }
  }
  for (const key of ALL_SESSION_KEYS) {
    try { sessionStorage.removeItem(key); } catch {}
  }
}

/**
 * hardReset — Debug-only full wipe
 *
 * Clears everything except mpm_textsize.
 * Includes mpm_daily_session (resets free counter).
 */
export function hardReset(): void {
  const preserve = new Set(PERSIST_ALWAYS);

  for (const key of ALL_LOCAL_KEYS) {
    if (!preserve.has(key)) {
      try { localStorage.removeItem(key); } catch {}
    }
  }
  for (const key of ALL_SESSION_KEYS) {
    try { sessionStorage.removeItem(key); } catch {}
  }
}

/**
 * autoReset — Called on mount when returning without active paid session
 *
 * Same as softReset: clears session artifacts so the app feels "first time",
 * but preserves preferences, access credentials, and free usage counter.
 */
export function autoReset(): void {
  softReset();
}
