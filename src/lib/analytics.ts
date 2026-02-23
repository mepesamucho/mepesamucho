/**
 * analytics.ts — Minimal anonymous telemetry for mepesamucho.com
 *
 * PRIVACY GUARANTEES:
 * - NO user text, email, code, or PII is ever sent.
 * - Anonymous ID is a random UUID stored in localStorage (not linked to identity).
 * - Payloads contain only event names, timestamps, and structural metadata.
 * - IP is never stored as a field (server sees it naturally but does not persist it).
 *
 * OFFLINE RESILIENCE:
 * - Failed events are queued in localStorage (max 50).
 * - Queue is flushed on next page load.
 */

const ANON_ID_KEY = "mpm_anon_id";
const QUEUE_KEY = "mpm_analytics_queue";
const MAX_QUEUE = 50;
const TRACK_ENDPOINT = "/api/track";

// ── Anonymous ID ──────────────────────────────────────────────────────────────

function generateId(): string {
  // crypto.randomUUID() is available in all modern browsers
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function getAnonId(): string {
  try {
    let id = localStorage.getItem(ANON_ID_KEY);
    if (id) return id;
    id = generateId();
    localStorage.setItem(ANON_ID_KEY, id);
    return id;
  } catch {
    // localStorage blocked (e.g., Safari private mode) — return ephemeral ID
    return generateId();
  }
}

// ── Session ID (per-session, not persisted across tabs) ───────────────────────

let _sessionId: string | null = null;
let _sessionStartMs: number | null = null;
let _sessionTurns = 0;

export function startSession(): string {
  _sessionId = generateId();
  _sessionStartMs = Date.now();
  _sessionTurns = 0;
  return _sessionId;
}

export function getSessionId(): string | null {
  return _sessionId;
}

export function incrementTurns(): void {
  _sessionTurns++;
}

export function getSessionMeta(): { sessionId: string | null; turnsCount: number; durationMs: number } {
  return {
    sessionId: _sessionId,
    turnsCount: _sessionTurns,
    durationMs: _sessionStartMs ? Date.now() - _sessionStartMs : 0,
  };
}

// ── Offline queue ─────────────────────────────────────────────────────────────

interface QueuedEvent {
  name: string;
  props: Record<string, unknown>;
  anonId: string;
  ts: number;
}

function loadQueue(): QueuedEvent[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.slice(-MAX_QUEUE);
    }
  } catch {}
  return [];
}

function saveQueue(queue: QueuedEvent[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-MAX_QUEUE)));
  } catch {}
}

function clearQueue(): void {
  try {
    localStorage.removeItem(QUEUE_KEY);
  } catch {}
}

// ── Core track function ───────────────────────────────────────────────────────

export function track(name: string, props: Record<string, unknown> = {}): void {
  const anonId = getAnonId();
  const ts = Date.now();

  const payload: QueuedEvent = { name, props, anonId, ts };

  // Fire-and-forget POST with keepalive for page unload resilience
  try {
    fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).then((res) => {
      if (!res.ok) enqueue(payload);
    }).catch(() => {
      enqueue(payload);
    });
  } catch {
    enqueue(payload);
  }
}

function enqueue(event: QueuedEvent): void {
  const queue = loadQueue();
  queue.push(event);
  saveQueue(queue);
}

// ── Flush offline queue (call on page load) ───────────────────────────────────

export function flushQueue(): void {
  const queue = loadQueue();
  if (queue.length === 0) return;

  // Clear immediately to prevent duplicate flushes
  clearQueue();

  // Send all queued events as a batch
  try {
    fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch: queue }),
      keepalive: true,
    }).catch(() => {
      // Re-enqueue on failure (merge with any new events)
      const current = loadQueue();
      saveQueue([...queue, ...current]);
    });
  } catch {
    saveQueue(queue);
  }
}
