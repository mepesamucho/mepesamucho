"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────

interface ConfirmResult {
  ok: boolean;
  code?: string;
  email?: string;
  type?: "single" | "monthly";
  expires_at?: string | null;
  error?: string;
}

// ── Constants ──────────────────────────────────────

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

// ── Inner component (needs Suspense for useSearchParams) ──

function ConfirmInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    if (!sessionId) {
      setStatus("error");
      setErrorMsg("No se encontró la sesión de pago.");
      return;
    }

    confirmPayment(sessionId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function confirmPayment(sid: string) {
    let lastError = "";

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const res = await fetch("/api/stripe/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sid }),
        });

        const data: ConfirmResult = await res.json();

        if (data.ok && data.code && data.type) {
          // ── Save to localStorage ──
          localStorage.setItem("mpm_code", data.code);
          if (data.email) {
            localStorage.setItem("mpm_email", data.email);
          }

          // ── Activate dayPass ──
          if (data.type === "single") {
            // Daypass: 1 extra session, expires end of local day
            const now = new Date();
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
            localStorage.setItem("mpm_daypass", JSON.stringify({ sessionsRemaining: 1, expiresAt: endOfDay }));
          } else if (data.type === "monthly") {
            // Subscription: unlimited sessions for 30 days
            const expires30d = Date.now() + 30 * 24 * 60 * 60 * 1000;
            localStorage.setItem("mpm_daypass", JSON.stringify({ expiresAt: expires30d }));
          }

          // ── Signal for page.tsx auto-resume ──
          sessionStorage.setItem(
            "mpm_payment_confirmed",
            JSON.stringify({ type: data.type, ts: Date.now() })
          );

          setStatus("success");

          // Redirect after brief pause for visual feedback
          setTimeout(() => {
            router.replace("/?confirmed=1");
          }, 800);
          return;
        }

        lastError = data.error || "Error desconocido";
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Error de conexión";
      }

      // Wait before retry (except on last attempt)
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      }
    }

    // All retries exhausted
    setStatus("error");
    setErrorMsg(lastError);
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        fontFamily: "var(--font-sans, 'Inter', sans-serif)",
        color: "var(--color-text, #2D2D2D)",
        background: "var(--color-bg, #FAF9F7)",
      }}
    >
      {status === "loading" && (
        <div style={{ textAlign: "center" }}>
          {/* Subtle pulse animation */}
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "var(--color-primary, #335A4C)",
              opacity: 0.6,
              animation: "confirmPulse 1.5s ease-in-out infinite",
            }}
          />
          <h1
            style={{
              fontFamily: "var(--font-heading, 'Fraunces', serif)",
              fontSize: "24px",
              fontWeight: 500,
              fontStyle: "italic",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
            }}
          >
            Confirmando tu acceso…
          </h1>
          <p
            style={{
              fontSize: "14px",
              opacity: 0.65,
              color: "var(--color-text-secondary, #6B6B6B)",
            }}
          >
            Solo un momento
          </p>
        </div>
      )}

      {status === "success" && (
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 24px",
              borderRadius: "50%",
              background: "var(--color-primary, #335A4C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading, 'Fraunces', serif)",
              fontSize: "24px",
              fontWeight: 500,
              fontStyle: "italic",
              letterSpacing: "-0.02em",
            }}
          >
            Listo
          </h1>
        </div>
      )}

      {status === "error" && (
        <div style={{ textAlign: "center", maxWidth: "380px" }}>
          <h1
            style={{
              fontFamily: "var(--font-heading, 'Fraunces', serif)",
              fontSize: "24px",
              fontWeight: 500,
              fontStyle: "italic",
              marginBottom: "12px",
              letterSpacing: "-0.02em",
            }}
          >
            Hubo un problema
          </h1>
          <p
            style={{
              fontSize: "14px",
              opacity: 0.65,
              color: "var(--color-text-secondary, #6B6B6B)",
              marginBottom: "32px",
              lineHeight: 1.5,
            }}
          >
            {errorMsg || "No pudimos confirmar tu pago. Intenta de nuevo o usa tu código de acceso."}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => router.replace("/")}
              style={{
                padding: "14px 32px",
                borderRadius: "12px",
                border: "none",
                background: "var(--color-primary, #335A4C)",
                color: "white",
                fontSize: "15px",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-sans, 'Inter', sans-serif)",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--color-primary-hover, #3B6858)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--color-primary, #335A4C)")}
            >
              Volver al inicio
            </button>
            <button
              onClick={() => {
                // Go to main page — recover-access flow is there
                router.replace("/?recover=1");
              }}
              style={{
                padding: "10px 24px",
                borderRadius: "12px",
                border: "none",
                background: "transparent",
                color: "var(--color-text-secondary, #6B6B6B)",
                fontSize: "14px",
                cursor: "pointer",
                fontFamily: "var(--font-sans, 'Inter', sans-serif)",
                textDecoration: "underline",
                textUnderlineOffset: "3px",
              }}
            >
              Ya tengo un código
            </button>
          </div>
        </div>
      )}

      {/* Pulse animation */}
      <style>{`
        @keyframes confirmPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}

// ── Page (wrapped in Suspense for searchParams) ──

export default function ConfirmPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-sans, 'Inter', sans-serif)",
            color: "var(--color-text, #2D2D2D)",
            background: "var(--color-bg, #FAF9F7)",
          }}
        >
          <p style={{ opacity: 0.5 }}>Cargando…</p>
        </div>
      }
    >
      <ConfirmInner />
    </Suspense>
  );
}
