/**
 * freeUsageManager.ts — Rolling 24h free usage limit for mepesamucho.com
 * FASE 1: 2 free reflections per rolling 24-hour window.
 *
 * Uses localStorage key: mpm_free_usage
 * Stores an array of timestamps (up to last 2) of completed reflections.
 * Anonymous: no IP, no fingerprinting — just local timestamps.
 */

const STORAGE_KEY = "mpm_free_usage";
const MAX_FREE = 2;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

interface FreeUsageData {
  timestamps: number[]; // epoch ms of each completed reflection
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
 * Get timestamps of reflections within the current 24h window.
 */
function getActiveTimestamps(): number[] {
  const data = loadData();
  const cutoff = Date.now() - WINDOW_MS;
  return data.timestamps.filter((ts) => ts > cutoff);
}

/**
 * How many free reflections remain in the current 24h window.
 */
export function freeRemaining(): number {
  return Math.max(0, MAX_FREE - getActiveTimestamps().length);
}

/**
 * Whether the user can start a new free reflection.
 */
export function canUseFree(): boolean {
  return freeRemaining() > 0;
}

/**
 * Record a completed reflection. Call this when the user finishes writing
 * (at the point where the essay is generated, not at page load).
 */
export function recordFreeUse(): void {
  const active = getActiveTimestamps();
  active.push(Date.now());
  saveData({ timestamps: active.slice(-MAX_FREE) });
}

/**
 * Milliseconds until the next free reflection becomes available.
 * Returns 0 if a free slot is already available.
 */
export function msUntilNextFree(): number {
  const active = getActiveTimestamps();
  if (active.length < MAX_FREE) return 0;
  // The oldest active timestamp + 24h = when it expires
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
