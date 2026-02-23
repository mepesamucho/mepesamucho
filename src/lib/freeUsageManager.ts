/**
 * freeUsageManager.ts — Daily free session limit for mepesamucho.com
 *
 * NEW MODEL: 1 complete session per rolling 24-hour window.
 * A "session" = initial reflection + continuation + dialog (unlimited interactions).
 * The paywall only appears BEFORE starting a new session, never mid-session.
 *
 * Uses localStorage key: mpm_daily_session
 * Migrates from legacy key: mpm_free_usage (old 2-reflection model)
 *
 * Anonymous: no IP, no fingerprinting — just local timestamps.
 */

const STORAGE_KEY = "mpm_daily_session";
const LEGACY_KEY = "mpm_free_usage";
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

interface DailySessionData {
  startedAt: number; // epoch ms when reflection was generated
  expiresAt: number; // startedAt + 24h
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function loadData(): DailySessionData | null {
  // Try new key first
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.startedAt === "number" && typeof parsed.expiresAt === "number") {
        return parsed;
      }
    }
  } catch {}

  // Migrate from legacy mpm_free_usage if present
  try {
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw);
      if (Array.isArray(legacy.timestamps) && legacy.timestamps.length > 0) {
        const now = Date.now();
        const cutoff = now - WINDOW_MS;
        // Find most recent non-expired timestamp
        const active = legacy.timestamps
          .filter((ts: number) => ts > cutoff)
          .sort((a: number, b: number) => b - a);

        if (active.length > 0) {
          // User has an active session from old model — migrate it
          const mostRecent = active[0];
          const migrated: DailySessionData = {
            startedAt: mostRecent,
            expiresAt: mostRecent + WINDOW_MS,
          };
          saveData(migrated);
          localStorage.removeItem(LEGACY_KEY);
          return migrated;
        }
      }
      // All timestamps expired or empty — just clean up
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {}

  return null;
}

function saveData(data: DailySessionData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Can the user start a new free session?
 * true if no session was started in the last 24h.
 */
export function canStartFreeSession(): boolean {
  const data = loadData();
  if (!data) return true;
  return Date.now() > data.expiresAt;
}

/**
 * Is there an active free session in progress?
 * true if a session was started within the last 24h.
 * Use this to unlock continuation/dialog within the current session.
 */
export function hasFreeSessionActive(): boolean {
  const data = loadData();
  if (!data) return false;
  return Date.now() <= data.expiresAt;
}

/**
 * Register that the user started their daily free session.
 * Call ONLY when /api/reflect succeeds (initial reflection).
 * Do NOT call if dayPass is active (paid users don't consume free quota).
 */
export function registerFreeSessionStart(): void {
  const now = Date.now();
  saveData({
    startedAt: now,
    expiresAt: now + WINDOW_MS,
  });
}

/**
 * Milliseconds until the next free session becomes available.
 * Returns 0 if a free session is already available.
 */
export function msUntilNextFreeSession(): number {
  const data = loadData();
  if (!data) return 0;
  return Math.max(0, data.expiresAt - Date.now());
}

/**
 * Format milliseconds into a human-readable Spanish countdown.
 * e.g. "2h 15m" or "45m" or "menos de 1m"
 */
export function formatCountdown(ms: number): string {
  if (ms <= 0) return "";
  const totalMin = Math.ceil(ms / 60000);
  if (totalMin < 1) return "menos de 1m";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
