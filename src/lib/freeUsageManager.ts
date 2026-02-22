/**
 * freeUsageManager.ts — Rolling 24h free usage limit for mepesamucho.com
 * FASE 1: 2 free reflections per rolling 24-hour window.
 *
 * This is the SOLE source of truth for free usage gating.
 * Uses localStorage key: mpm_free_usage
 * Anonymous: no IP, no fingerprinting — just local timestamps.
 *
 * Important: Usage increments ONLY when the initial reflection is generated,
 * NOT on conversation turns, paywall views, or page refresh.
 */

const STORAGE_KEY = "mpm_free_usage";
const MAX_FREE = 2;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

interface FreeUsageData {
  timestamps: number[]; // epoch ms of each completed initial reflection
}

function loadData(): FreeUsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.timestamps)) return parsed;
    }
  } catch {}
  return { timestamps: [] };
}

function saveData(data: FreeUsageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

/**
 * Get timestamps of reflections within the current 24h window (public).
 */
export function getTimestamps(): number[] {
  const data = loadData();
  const cutoff = Date.now() - WINDOW_MS;
  return data.timestamps.filter((ts) => ts > cutoff);
}

/**
 * How many free reflections remain in the current 24h window.
 */
export function getFreeRemaining(): number {
  return Math.max(0, MAX_FREE - getTimestamps().length);
}

/**
 * Whether the user can start a new free initial reflection.
 * This is the ONLY gating check for free users.
 */
export function canUseFreeInitialReflection(): boolean {
  return getFreeRemaining() > 0;
}

/**
 * Record a completed initial reflection.
 * Call ONLY when the /api/reflect response succeeds (initial reflection).
 * Do NOT call for conversation turns or continuation.
 */
export function registerInitialReflectionUse(): void {
  const active = getTimestamps();
  active.push(Date.now());
  saveData({ timestamps: active.slice(-MAX_FREE) });
}

/**
 * Milliseconds until the next free reflection becomes available.
 * Returns 0 if a free slot is already available.
 */
export function msUntilNextFree(): number {
  const active = getTimestamps();
  if (active.length < MAX_FREE) return 0;
  const oldest = Math.min(...active);
  const expiresAt = oldest + WINDOW_MS;
  return Math.max(0, expiresAt - Date.now());
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
