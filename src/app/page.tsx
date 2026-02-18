"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { jsPDF } from "jspdf";
import { detectarCrisis, CRISIS_RESOURCES } from "@/data/crisis";
import { MARCOS, type Marco } from "@/data/citas";

// ── TYPES ──────────────────────────────────────

type Step =
  | "landing"
  | "writing"
  | "dissolving"
  | "message"
  | "framework"
  | "preguntas"
  | "generating"
  | "essay"
  | "access_choice"
  | "limit";

// ── LOCAL STORAGE HELPERS ──────────────────────

function getUsosHoy(): number {
  try {
    const saved = localStorage.getItem("mpm_usos");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === new Date().toDateString()) return parsed.count;
    }
  } catch {}
  return 0;
}

function saveUsosHoy(count: number) {
  try {
    localStorage.setItem("mpm_usos", JSON.stringify({ date: new Date().toDateString(), count }));
  } catch {}
}

function getDayPass(): { active: boolean; hoursLeft: number } {
  try {
    const saved = localStorage.getItem("mpm_daypass");
    if (saved) {
      const expires = JSON.parse(saved).expires;
      const remaining = expires - Date.now();
      if (remaining > 0) return { active: true, hoursLeft: Math.ceil(remaining / 3600000) };
    }
  } catch {}
  return { active: false, hoursLeft: 0 };
}

function activateDayPass() {
  try {
    localStorage.setItem("mpm_daypass", JSON.stringify({ expires: Date.now() + 86400000 }));
  } catch {}
}

function activateSinglePass() {
  try {
    localStorage.setItem("mpm_single", JSON.stringify({ date: new Date().toDateString(), available: 1 }));
  } catch {}
}

function getSinglePass(): boolean {
  try {
    const saved = localStorage.getItem("mpm_single");
    if (saved) {
      const p = JSON.parse(saved);
      if (p.date === new Date().toDateString() && p.available > 0) return true;
    }
  } catch {}
  return false;
}

function useSinglePass() {
  try {
    const saved = localStorage.getItem("mpm_single");
    if (saved) {
      const p = JSON.parse(saved);
      p.available = Math.max(0, (p.available || 1) - 1);
      localStorage.setItem("mpm_single", JSON.stringify(p));
    }
  } catch {}
}

// ── DOWNLOAD REFLECTION AS PDF ─────────────────

function descargarReflexionPDF(reflexion: string, citas: { source: string; text: string }[], marcoNombre: string, fraseUsuario?: string) {
  const fecha = new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" });
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const marginL = 25;
  const marginR = 25;
  const maxW = pageW - marginL - marginR;
  let y = 30;

  const addPageIfNeeded = (neededSpace: number) => {
    if (y + neededSpace > 270) {
      doc.addPage();
      y = 25;
    }
  };

  // Header
  doc.setFont("helvetica", "normal");
  doc.setFontSize(22);
  doc.setTextColor(58, 55, 51);
  doc.text("mepesamucho", pageW / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(111, 106, 100);
  doc.text(fecha, pageW / 2, y, { align: "center" });
  y += 6;

  // Divider
  doc.setDrawColor(122, 139, 111);
  doc.line(pageW / 2 - 15, y, pageW / 2 + 15, y);
  y += 8;

  doc.setFontSize(8);
  doc.setTextColor(111, 106, 100);
  doc.text(marcoNombre.toUpperCase(), pageW / 2, y, { align: "center" });
  y += 10;

  // User's selected phrase
  if (fraseUsuario && fraseUsuario.trim()) {
    addPageIfNeeded(16);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(111, 106, 100);
    const fraseLines = doc.splitTextToSize(`"${fraseUsuario.trim()}"`, maxW - 20);
    doc.text(fraseLines, pageW / 2, y, { align: "center" });
    y += fraseLines.length * 4 + 10;
  } else {
    y += 2;
  }

  // Reflection body
  const paragraphs = reflexion.split("\n\n").filter((p) => p.trim());
  paragraphs.forEach((p) => {
    const t = p.trim().replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
    if (!t) return;
    const isCita = t.startsWith("<<") || t.startsWith("\u00AB") || t.startsWith('"');
    const isAttrib = t.startsWith("\u2014") || t.startsWith("--");
    const isQ = t.endsWith("?") && t.length < 200;

    if (isCita) {
      addPageIfNeeded(20);
      doc.setDrawColor(122, 139, 111);
      doc.setFillColor(232, 238, 228);
      const lines = doc.splitTextToSize(t, maxW - 10);
      const blockH = lines.length * 5 + 6;
      doc.rect(marginL, y - 2, maxW, blockH, "F");
      doc.line(marginL, y - 2, marginL, y - 2 + blockH);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(58, 55, 51);
      doc.text(lines, marginL + 5, y + 3);
      y += blockH + 6;
    } else if (isAttrib) {
      addPageIfNeeded(8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(111, 106, 100);
      doc.text(t, marginL + 5, y);
      y += 8;
    } else if (isQ) {
      addPageIfNeeded(12);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10.5);
      doc.setTextColor(90, 110, 77);
      const lines = doc.splitTextToSize(t, maxW);
      doc.text(lines, pageW / 2, y, { align: "center" });
      y += lines.length * 5 + 8;
    } else {
      addPageIfNeeded(12);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(58, 55, 51);
      const lines = doc.splitTextToSize(t, maxW);
      doc.text(lines, marginL, y, { align: "justify", maxWidth: maxW });
      y += lines.length * 4.5 + 6;
    }
  });

  // Fuentes citadas section
  addPageIfNeeded(20);
  y += 6;
  doc.setDrawColor(216, 207, 196);
  doc.line(marginL, y, pageW - marginR, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(58, 55, 51);
  doc.text("Fuentes citadas", marginL, y);
  y += 10;

  citas.forEach((c) => {
    addPageIfNeeded(18);
    doc.setDrawColor(216, 207, 196);
    doc.line(marginL, y - 1, marginL, y + 10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(92, 87, 81);
    doc.text(c.source, marginL + 4, y + 2);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(111, 106, 100);
    const citaLines = doc.splitTextToSize(c.text, maxW - 8);
    doc.text(citaLines, marginL + 4, y + 7);
    y += citaLines.length * 4 + 12;
  });

  // Footer
  addPageIfNeeded(15);
  y += 8;
  doc.setDrawColor(216, 207, 196);
  doc.line(marginL, y, pageW - marginR, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(133, 127, 120);
  doc.text("mepesamucho.com \u00B7 Un espacio de reflexi\u00F3n, no de consejer\u00EDa.", pageW / 2, y, { align: "center" });
  y += 4;
  doc.text("Lo que escribes no se almacena ni se comparte.", pageW / 2, y, { align: "center" });

  doc.save(`reflexion-mepesamucho-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── CHECKOUT HELPER ────────────────────────────

async function checkout(type: "subscription" | "daypass" | "single", beforeRedirect?: () => void) {
  try {
    if (beforeRedirect) beforeRedirect();
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  } catch (err) {
    console.error("Checkout error:", err);
  }
}

// ── LOGO SVG (manos abiertas) ─────────────────

const LogoIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M14 34c-2-1-4-3-5-6-1-2-1-4 0-6l3-5c1-1 2-2 3-1l1 2 1-4c0-2 1-3 2-3s2 1 2 3l0 3 1-5c0-2 1-3 2-3s2 1 2 3l-1 6"
      stroke="#7A8B6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
    <path
      d="M34 34c2-1 4-3 5-6 1-2 1-4 0-6l-3-5c-1-1-2-2-3-1l-1 2-1-4c0-2-1-3-2-3s-2 1-2 3l0 3-1-5c0-2-1-3-2-3s-2 1-2 3l1 6"
      stroke="#7A8B6F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
    <path d="M14 34c3 3 7 4 10 4s7-1 10-4" stroke="#7A8B6F" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

// ── PRIVACY BADGE ─────────────────────────────

const PrivacyBadge = ({ onClick }: { onClick?: () => void }) => (
  <div className="flex items-center gap-2 justify-center">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6F6A64" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
    <span className="font-[var(--font-sans)] text-xs text-[#6F6A64]">
      Tu información es privada y segura.{" "}
      {onClick && (
        <button
          onClick={onClick}
          className="underline decoration-[#D8CFC4] underline-offset-2 hover:text-[#5C7350] transition-colors bg-transparent border-none cursor-pointer text-xs text-[#6F6A64] font-[var(--font-sans)]"
        >
          Política de privacidad
        </button>
      )}
    </span>
  </div>
);

// ── FONT SIZE BUTTON ──────────────────────────

const FONT_SIZES = [
  { label: "A", base: "1.25rem", lg: "1.35rem", xl: "1.45rem", cita: "1.4rem" },
  { label: "A+", base: "1.4rem", lg: "1.5rem", xl: "1.6rem", cita: "1.55rem" },
  { label: "A++", base: "1.55rem", lg: "1.65rem", xl: "1.75rem", cita: "1.7rem" },
];

// ── GENERATING MESSAGES ───────────────────────

const GEN_MESSAGES = [
  "Preparando tu reflexión...",
  "Buscando las palabras correctas...",
  "Escuchando lo que escribiste...",
  "Casi listo...",
];

// ── SHARED STYLES ──────────────────────────────
// Color theory: bg #F3EFEA (luminance ~0.87)
// #3A3733 = primary text (ratio ~10.3:1 ✓ AAA)
// #5C5751 = strong secondary (ratio ~6.3:1 ✓ AA)
// #6F6A64 = secondary text (ratio ~4.7:1 ✓ AA)
// #857F78 = tertiary/decorative (ratio ~3.5:1 ✓ AA large only)
// #8A8580 = counter text (ratio ~3.2:1 ✓ AA large)
// #5C7350 = btn bg (ratio ~5.2:1 with white ✓ AA)
// #7A8B6F = accent decorative (borders, dividers, focus rings)
// NEVER use opacity on text — kills contrast

const S = {
  page: "min-h-screen bg-[#F3EFEA] text-[#3A3733] font-[var(--font-serif)] flex flex-col items-center justify-center px-5 py-10 leading-loose",
  pageTop: "min-h-screen bg-[#F3EFEA] text-[#3A3733] font-[var(--font-serif)] flex flex-col items-center justify-start px-5 pt-14 pb-14 leading-loose",
  box: "max-w-[640px] w-full",
  boxWide: "max-w-[680px] w-full",
  btn: "font-[var(--font-serif)] text-lg px-8 py-3.5 bg-[#5C7350] text-white border border-[#5C7350] rounded-lg cursor-pointer transition-all duration-250 hover:bg-[#4E6642] hover:border-[#4E6642] btn-primary-glow",
  btnSecondary: "font-[var(--font-serif)] text-lg px-7 py-3 bg-[#EAE4DC] text-[#3A3733] border border-[#D8CFC4] rounded-lg cursor-pointer transition-all duration-250 hover:bg-[#5C7350] hover:text-white hover:border-[#5C7350]",
  btnSm: "font-[var(--font-serif)] text-base px-5 py-2.5 bg-[#EAE4DC] text-[#3A3733] border border-[#D8CFC4] rounded-lg cursor-pointer transition-all duration-250 hover:bg-[#5C7350] hover:text-white hover:border-[#5C7350]",
  sub: "font-[var(--font-sans)] text-[#6F6A64] font-light leading-relaxed",
  subStrong: "font-[var(--font-sans)] text-[#5C5751] font-light leading-relaxed",
  link: "font-[var(--font-sans)] text-[#6F6A64] font-light text-xs cursor-pointer underline decoration-[#D8CFC4] underline-offset-4 hover:text-[#5C7350] transition-colors bg-transparent border-none",
  textarea: "w-full min-h-[120px] p-4 font-[var(--font-serif)] text-[1.2rem] leading-relaxed bg-transparent border border-[#D8CFC4] rounded-lg resize-y outline-none text-left",
  textareaLg: "w-full min-h-[240px] p-5 font-[var(--font-serif)] text-xl leading-relaxed bg-transparent border border-[#D8CFC4] rounded-lg resize-y outline-none",
  divider: "w-8 h-px bg-[#7A8B6F] mx-auto",
};

// ── MAIN COMPONENT ─────────────────────────────

export default function MePesaMucho() {
  const [step, setStep] = useState<Step>("landing");
  const [texto, setTexto] = useState("");
  const [marco, setMarco] = useState<Marco | null>(null);
  const [reflexion, setReflexion] = useState("");
  const [citasUsadas, setCitasUsadas] = useState<{ source: string; text: string }[]>([]);
  const [showCrisis, setShowCrisis] = useState(false);
  const [crisisAck, setCrisisAck] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [preguntaStep, setPreguntaStep] = useState(0);
  const [resp1, setResp1] = useState("");
  const [resp2, setResp2] = useState("");
  const [cierreStep, setCierreStep] = useState(0);
  const [cierreTexto, setCierreTexto] = useState("");
  const [cierreTexto2, setCierreTexto2] = useState("");
  const [showCierreInput, setShowCierreInput] = useState(false);
  const [msgOpacity, setMsgOpacity] = useState(0);
  const [usosHoy, setUsosHoy] = useState(0);
  const [dayPass, setDayPass] = useState({ active: false, hoursLeft: 0 });
  const [fadeKey, setFadeKey] = useState(0);
  const [apiError, setApiError] = useState("");
  const [fontSize, setFontSize] = useState(0);
  const [showCrisisBanner, setShowCrisisBanner] = useState(false);
  const [crisisDetectedInText, setCrisisDetectedInText] = useState(false);
  const [showFuentes, setShowFuentes] = useState(false);
  const [lastSessionId, setLastSessionId] = useState("");
  const [lastPaymentType, setLastPaymentType] = useState("");
  const [accessEmail, setAccessEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [accessSaving, setAccessSaving] = useState(false);
  const [accessDone, setAccessDone] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [recoveryMode, setRecoveryMode] = useState<"email" | "code" | null>(null);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [genMsgIndex, setGenMsgIndex] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [readyContinue, setReadyContinue] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [continuacion, setContinuacion] = useState("");
  const [continuacionCitas, setContinuacionCitas] = useState<{ source: string; text: string }[]>([]);
  const [continuacionLoading, setContinuacionLoading] = useState(false);
  const [continuacionDesbloqueada, setContinuacionDesbloqueada] = useState(false);
  const [showContinuacionFuentes, setShowContinuacionFuentes] = useState(false);
  // Dialog state
  const [dialogTurnos, setDialogTurnos] = useState<{ role: "user" | "assistant"; content: string; cita?: { source: string; text: string } }[]>([]);
  const [dialogInput, setDialogInput] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogCerrado, setDialogCerrado] = useState(false);
  const [allCitas, setAllCitas] = useState<{ source: string; text: string }[]>([]);
  const dialogEndRef = useRef<HTMLDivElement>(null);
  const crisisShownOnce = useRef(false);
  const scrollCardRef = useRef<HTMLDivElement>(null);

  // Init
  useEffect(() => {
    setUsosHoy(getUsosHoy());
    setDayPass(getDayPass());

    const params = new URLSearchParams(window.location.search);
    const sid = params.get("session_id");
    const type = params.get("type");
    if (sid && type) {
      fetch("/api/verify-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.success) {
            if (type === "daypass") { activateDayPass(); setDayPass({ active: true, hoursLeft: 24 }); }
            if (type === "single") activateSinglePass();
            if (type === "subscription") { activateDayPass(); setDayPass({ active: true, hoursLeft: 720 }); }
            window.history.replaceState({}, "", "/");

            // Check if there's a saved continuación to restore (post-payment from essay)
            try {
              const saved = sessionStorage.getItem("mpm_continuacion");
              if (saved) {
                const data = JSON.parse(saved);
                if (data.continuacion) {
                  setContinuacion(data.continuacion);
                  setContinuacionCitas(data.continuacionCitas || []);
                  setContinuacionDesbloqueada(true);
                  setReflexion(data.reflexion || "");
                  setCitasUsadas(data.citasUsadas || []);
                  setMarco(data.marco || null);
                  setCierreStep(2);
                  setStep("essay");
                  sessionStorage.removeItem("mpm_continuacion");
                  setLastSessionId(sid);
                  setLastPaymentType(type);
                  return; // Skip access_choice, go directly to essay
                }
              }
            } catch {}

            setLastSessionId(sid);
            setLastPaymentType(type);
            setStep("access_choice");
          }
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => { setFadeKey((k) => k + 1); }, [step, preguntaStep, cierreStep]);

  // Generating step: rotate messages
  useEffect(() => {
    if (step !== "generating") return;
    setGenMsgIndex(0);
    const interval = setInterval(() => {
      setGenMsgIndex((prev) => (prev + 1) % GEN_MESSAGES.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [step]);

  // Scroll hint: hide when user scrolls the card
  useEffect(() => {
    const card = scrollCardRef.current;
    if (!card) return;
    const onScroll = () => {
      if (card.scrollTop > 30) setShowScrollHint(false);
    };
    card.addEventListener("scroll", onScroll);
    return () => card.removeEventListener("scroll", onScroll);
  }, [step]);

  // ── CRISIS CHECK (universal — used on ALL textareas) ─

  const checkCrisisInText = useCallback((value: string) => {
    if (value.length > 5 && detectarCrisis(value)) {
      setCrisisDetectedInText(true);
      setShowCrisisBanner(true);
      if (!crisisShownOnce.current) {
        crisisShownOnce.current = true;
        setShowCrisis(true);
      }
    }
  }, []);

  // ── HANDLERS ─────────────────────────────────

  const handleTextoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setTexto(v);
    checkCrisisInText(v);
  };

  const handleResp1Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setResp1(v);
    checkCrisisInText(v);
  };

  const handleResp2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setResp2(v);
    checkCrisisInText(v);
  };

  const handleCierreTextoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setCierreTexto(v);
    checkCrisisInText(v);
  };

  const handleCierreTexto2Change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const v = e.target.value;
    setCierreTexto2(v);
    checkCrisisInText(v);
  };

  const iniciarDisolucion = useCallback(() => {
    if (!texto.trim()) return;
    if (crisisDetectedInText && !crisisAck) {
      setShowCrisis(true);
      return;
    }
    if (crisisDetectedInText) {
      setShowCrisisBanner(true);
    }
    setStep("dissolving");
    setReadyContinue(false);
    // Slower dissolution: 5s dissolve animation, then show message
    setTimeout(() => {
      setStep("message");
      setMsgOpacity(0);
      setTimeout(() => setMsgOpacity(1), 200);
      // User controls when to continue — show button after 2.5s
      setTimeout(() => setReadyContinue(true), 2500);
    }, 5000);
  }, [texto, crisisAck, crisisDetectedInText]);

  const generarReflexion = useCallback(async () => {
    setStep("generating");
    setApiError("");
    try {
      const res = await fetch("/api/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          texto: texto.slice(0, 2000),
          marco,
          respuesta1: resp1,
          respuesta2: resp2,
          crisisDetected: crisisDetectedInText,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setReflexion(data.reflexion);
      setCitasUsadas(data.citasUsadas || []);
      setStep("essay");
      setShowScrollHint(true);
      const n = usosHoy + 1;
      setUsosHoy(n);
      saveUsosHoy(n);
      if (getSinglePass()) useSinglePass();
    } catch {
      setApiError("Hubo un error generando tu reflexión. Intenta de nuevo.");
      setStep("framework");
    }
    try { sessionStorage.setItem("mpm_texto", texto.slice(0, 2000)); } catch {}
    setTexto("");
  }, [texto, marco, resp1, resp2, usosHoy, crisisDetectedInText]);

  // Generate continuation reflection
  const generarContinuacion = useCallback(async () => {
    setContinuacionLoading(true);
    setContinuacion("");
    setContinuacionCitas([]);
    try {
      const res = await fetch("/api/reflect-continue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          textoOriginal: texto || sessionStorage.getItem("mpm_texto") || "",
          marco,
          reflexionOriginal: reflexion.slice(0, 1500),
          respuestaCierre1: cierreTexto,
          respuestaCierre2: cierreTexto2,
          crisisDetected: crisisDetectedInText,
          citasOriginales: citasUsadas.map((c) => c.source),
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setContinuacion(data.continuacion);
      setContinuacionCitas(data.citasUsadas || []);
      // Save to sessionStorage for post-payment recovery
      try {
        sessionStorage.setItem("mpm_continuacion", JSON.stringify({
          continuacion: data.continuacion,
          continuacionCitas: data.citasUsadas || [],
          reflexion, citasUsadas, marco, cierreStep: 2,
        }));
      } catch {}
    } catch {
      setContinuacion("");
    }
    setContinuacionLoading(false);
  }, [texto, marco, reflexion, cierreTexto, cierreTexto2, crisisDetectedInText, citasUsadas]);

  // Dialog: send message
  const DIALOG_ACTIVE_LIMIT = 6; // After this many user turns, switch to open mode
  const enviarDialogo = useCallback(async (mensaje: string) => {
    if (!mensaje.trim() || dialogLoading) return;
    const nuevoTurno: { role: "user" | "assistant"; content: string; cita?: { source: string; text: string } } = { role: "user", content: mensaje };
    const turnosActualizados = [...dialogTurnos, nuevoTurno];
    setDialogTurnos(turnosActualizados);
    setDialogInput("");
    setDialogLoading(true);

    const turnoNum = turnosActualizados.filter((t) => t.role === "user").length;
    const modoAbierto = turnoNum >= DIALOG_ACTIVE_LIMIT;

    // Collect all citas already used
    const citasYaUsadas = [
      ...citasUsadas.map((c) => c.source),
      ...continuacionCitas.map((c) => c.source),
      ...turnosActualizados.filter((t) => t.cita).map((t) => t.cita!.source),
    ];

    try {
      const res = await fetch("/api/reflect-dialog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marco,
          respuestaUsuario: mensaje.slice(0, 500),
          historial: turnosActualizados.map((t) => ({ role: t.role, content: t.content })),
          turnoActual: turnoNum,
          modoAbierto,
          citasYaUsadas,
          crisisDetected: crisisDetectedInText,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setDialogTurnos((prev) => [...prev, { role: "assistant", content: data.respuesta, cita: data.cita }]);
      // Scroll to bottom
      setTimeout(() => dialogEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setDialogTurnos((prev) => [...prev, { role: "assistant", content: "Hubo un error. ¿Quieres intentar de nuevo?" }]);
    }
    setDialogLoading(false);
  }, [dialogTurnos, dialogLoading, marco, citasUsadas, continuacionCitas, crisisDetectedInText]);

  // Close dialog and collect all citas
  const cerrarDialogo = useCallback(() => {
    const dialogCitasArr = dialogTurnos.filter((t) => t.cita).map((t) => t.cita!);
    setAllCitas([...citasUsadas, ...continuacionCitas, ...dialogCitasArr]);
    setDialogCerrado(true);
  }, [dialogTurnos, citasUsadas, continuacionCitas]);

  const reiniciar = () => {
    setStep("landing");
    setTexto(""); setMarco(null); setReflexion(""); setCitasUsadas([]);
    setShowCrisis(false); setCrisisAck(false); setShowDisclaimer(false);
    setPreguntaStep(0); setResp1(""); setResp2("");
    setCierreStep(0); setCierreTexto(""); setCierreTexto2(""); setShowCierreInput(false);
    setMsgOpacity(0); setApiError(""); setShowCrisisBanner(false);
    setCrisisDetectedInText(false); crisisShownOnce.current = false;
    setShowFuentes(false); setShowAbout(false); setShowHowItWorks(false);
    setContinuacion(""); setContinuacionCitas([]); setContinuacionLoading(false);
    setContinuacionDesbloqueada(false); setShowContinuacionFuentes(false);
    setDialogTurnos([]); setDialogInput(""); setDialogLoading(false);
    setDialogCerrado(false); setAllCitas([]);
    setDayPass(getDayPass()); setUsosHoy(getUsosHoy());
    try { sessionStorage.removeItem("mpm_continuacion"); } catch {}
  };

  const fs = FONT_SIZES[fontSize];

  // ── CIERRE DATA ──────────────────────────────

  const PREGUNTAS_CIERRE = [
    "¿Qué te hace reflexionar esto?",
    "¿Qué se mueve dentro de ti al leer estas palabras?",
    "¿Hay alguna idea aquí que sientas que necesitabas escuchar hoy?",
    "¿Qué parte de esta reflexión te gustaría llevar contigo?",
    "Si esta reflexión fuera un espejo, ¿qué te devuelve?",
  ];
  const PROFUNDIZACIONES = [
    "Eso que mencionas tiene más capas de las que parece. A veces lo que nos hace reflexionar no es la idea en sí, sino el momento en que nos encuentra.",
    "Es interesante que eso sea lo que resuena. Muchas veces lo que se mueve dentro de nosotros señala algo que llevamos tiempo sin mirar.",
    "Hay algo valioso en reconocer eso. Las palabras que necesitamos escuchar suelen llegar disfrazadas de cosas simples.",
    "Lo que eliges llevar contigo dice mucho de dónde estás hoy. Y eso ya es una forma de avanzar.",
    "Lo que el espejo devuelve no siempre es cómodo, pero siempre es honesto. Ahí hay algo que vale la pena explorar.",
  ];
  const PREGUNTAS_SEGUNDO = [
    "Y si pudieras sentarte con esa reflexión un momento más... ¿qué crees que encontrarías?",
    "¿Hay algo detrás de eso que todavía no te has dicho a ti mismo?",
    "Si pudieras profundizar en esto con alguien que realmente entiende, ¿qué le preguntarías?",
    "¿Qué pasaría si te permitieras explorar esto un poco más?",
    "¿Sientes que hay algo más ahí, esperando salir?",
  ];
  const cIdx = Math.abs((reflexion || "").length + (marco || "").length) % PREGUNTAS_CIERRE.length;

  // ── HEADER COMPONENT ─────────────────────────

  const SiteHeader = () => (
    <div className="fixed top-0 left-0 right-0 z-30 bg-[#F3EFEA]/90 backdrop-blur-sm" style={{ borderBottom: "1px solid rgba(216,207,196,0.5)" }}>
      <div className="max-w-[680px] mx-auto px-5 py-3 flex items-center justify-between">
        <button onClick={reiniciar} className="flex items-center gap-2 bg-transparent border-none cursor-pointer" aria-label="Ir al inicio">
          <LogoIcon size={24} />
          <span className="text-lg font-light tracking-tight text-[#3A3733]">mepesamucho</span>
        </button>
        <div className="flex items-center gap-4">
          <button className={`${S.link} text-[0.7rem]`} onClick={() => setShowAbout(true)}>Acerca de</button>
          <button className={`${S.link} text-[0.7rem]`} onClick={() => setShowDisclaimer(true)}>Aviso legal</button>
        </div>
      </div>
    </div>
  );

  // ── MODALS ───────────────────────────────────

  const Overlay = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-[#3A3733]/40 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-[#F3EFEA] max-w-[560px] w-full rounded-lg p-8 max-h-[90vh] overflow-y-auto border border-[#D8CFC4]">
        {children}
      </div>
    </div>
  );

  const DisclaimerModal = () => (
    <Overlay>
      <div className={`${S.divider} mb-6`} style={{ width: 40 }} />
      <h2 className="text-xl font-medium text-center mb-6">Aviso legal y política de privacidad</h2>
      {[
        ["Esto no es terapia ni consejería profesional", "mepesamucho.com es un espacio de reflexión personal. No sustituye la atención psicológica, psiquiátrica o médica."],
        ["No es consejo médico ni legal", "Las reflexiones son de carácter espiritual y contemplativo. No deben interpretarse como diagnóstico o recomendación profesional."],
        ["Exención de responsabilidad por interpretación", "mepesamucho.com no se hace responsable por las interpretaciones, decisiones o acciones que el usuario tome a partir del contenido."],
        ["Tu privacidad es prioridad", "No almacenamos tu texto. Se procesa en el momento y se elimina. No se construyen perfiles de usuario. Si eliges guardar tu acceso con email, este se almacena como un hash irreversible — nunca en texto claro."],
        ["Fuentes verificadas", "Las citas provienen de fuentes verificadas y documentadas. No se inventan ni modifican citas."],
        ["En caso de crisis", "Si estás en una emergencia emocional o situación de riesgo, busca ayuda profesional inmediata."],
        ["Uso bajo tu propia responsabilidad", "Al utilizar mepesamucho.com aceptas que el servicio se ofrece tal cual, sin garantías."],
      ].map(([t, b], i) => (
        <div key={i} className="mb-4">
          <p className="text-[1.05rem] font-semibold mb-0.5">{t}</p>
          <p className={`${S.sub} text-sm`}>{b}</p>
        </div>
      ))}
      <div className="mt-6 pt-6 border-t border-[#D8CFC4] text-center">
        <button className={S.btnSecondary} onClick={() => setShowDisclaimer(false)}>Entendido</button>
      </div>
    </Overlay>
  );

  const AboutModal = () => (
    <Overlay>
      <div className={`${S.divider} mb-6`} style={{ width: 40 }} />
      <h2 className="text-xl font-medium text-center mb-6">Acerca de mepesamucho</h2>
      <div className="space-y-4">
        <p className={`${S.subStrong} text-sm leading-relaxed`}>
          <strong className="text-[#3A3733]">mepesamucho.com</strong> es un espacio digital de reflexión personal. Nació de la creencia de que a veces solo necesitamos soltar lo que cargamos y recibir una palabra que nos ayude a verlo desde otro lugar.
        </p>
        <p className={`${S.sub} text-sm leading-relaxed`}>
          No somos terapeutas ni consejeros. Somos un puente entre lo que sientes y la sabiduría de tradiciones que han acompañado al ser humano durante siglos: filosofía clásica, espiritualidad universal, textos bíblicos.
        </p>
        <p className={`${S.sub} text-sm leading-relaxed`}>
          Cada reflexión que recibes es única, generada a partir de lo que escribes y del marco que eliges. Las citas son reales y verificadas. Tu texto no se almacena ni se comparte.
        </p>
        <p className={`${S.sub} text-sm leading-relaxed`}>
          Desarrollado por <strong className="text-[#5C5751]">Lemon Films</strong> como un proyecto de bienestar emocional.
        </p>
      </div>
      <div className="mt-6 pt-6 border-t border-[#D8CFC4] text-center">
        <button className={S.btnSecondary} onClick={() => setShowAbout(false)}>Cerrar</button>
      </div>
    </Overlay>
  );

  const CrisisModal = () => (
    <Overlay>
      <div className="w-10 h-0.5 bg-[#8B6F5E] mx-auto mb-6" />
      <h2 className="text-xl font-medium mb-2 leading-snug">{CRISIS_RESOURCES.title}</h2>
      <p className={`${S.sub} text-sm mb-6`}>{CRISIS_RESOURCES.subtitle}</p>
      <div className="text-left">
        {CRISIS_RESOURCES.lines.map((l, i) => (
          <div key={i} className={`p-3 mb-1 rounded ${i % 2 === 0 ? "bg-[#F5ECE3]" : ""}`}>
            <p className={`${S.sub} text-[0.7rem] uppercase tracking-widest mb-0.5`} style={{ opacity: 0.7 }}>{l.country}</p>
            <p className="text-[1.05rem] font-medium">{l.name}</p>
            {l.isWeb ? (
              <a href={l.url} target="_blank" rel="noopener noreferrer" className={`${S.sub} text-sm text-[#6B7F5E] underline`}>{l.phone}</a>
            ) : (
              <p className="font-[var(--font-sans)] text-lg text-[#6B7F5E] font-medium tracking-wide">{l.phone}</p>
            )}
            {l.note && <p className={`${S.sub} text-xs mt-0.5`} style={{ opacity: 0.6 }}>{l.note}</p>}
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-[#D8CFC4] text-center">
        <p className={`${S.sub} text-sm italic mb-4`}>Si deseas continuar con tu reflexión, puedes hacerlo.</p>
        <button className={S.btnSecondary} onClick={() => { setShowCrisis(false); setCrisisAck(true); }}>
          Continuar con mi reflexión
        </button>
      </div>
    </Overlay>
  );

  // ── FUENTES CITADAS MODAL ──────────────────────

  const FuentesModal = () => (
    <Overlay>
      <div className={`${S.divider} mb-6`} style={{ width: 40 }} />
      <h2 className="text-xl font-medium text-center mb-6">Fuentes citadas</h2>
      <p className={`${S.sub} text-sm mb-6 text-center`}>
        Todas las citas utilizadas en tu reflexión provienen de fuentes verificadas.
      </p>
      {citasUsadas.map((c, i) => (
        <div key={i} className="mb-5 pl-4" style={{ borderLeftWidth: "2px", borderLeftStyle: "solid", borderLeftColor: "#D8CFC4" }}>
          <p className="text-sm font-medium mb-0.5">{c.source}</p>
          <p className={`${S.sub} text-sm italic leading-snug`}>{c.text}</p>
        </div>
      ))}
      <div className="mt-6 pt-6 border-t border-[#D8CFC4] text-center">
        <button className={S.btnSecondary} onClick={() => setShowFuentes(false)}>Cerrar</button>
      </div>
    </Overlay>
  );

  // ── CRISIS BANNER (persistent, non-intrusive) ─

  const CrisisBanner = () => (
    <div className="fixed top-0 left-0 right-0 z-40 animate-slide-down">
      <div className="bg-[#8B6F5E] text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0" aria-hidden="true">&#9829;</span>
          <p className="font-[var(--font-sans)] text-sm font-light leading-snug">
            Si necesitas hablar con alguien, hay personas preparadas para escucharte.{" "}
            <button
              onClick={() => setShowCrisis(true)}
              className="underline font-medium bg-transparent border-none text-white cursor-pointer"
            >
              Ver líneas de ayuda
            </button>
          </p>
        </div>
        <button
          onClick={() => setShowCrisisBanner(false)}
          className="text-white/70 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none flex-shrink-0 px-1"
          aria-label="Cerrar banner de crisis"
        >
          &times;
        </button>
      </div>
    </div>
  );

  // ── FONT SIZE TOGGLE ─────────────────────────

  const FontSizeToggle = () => (
    <div className="fixed bottom-6 right-6 z-30 flex flex-col items-center gap-1">
      <button
        onClick={() => setFontSize((f) => (f + 1) % FONT_SIZES.length)}
        className="w-11 h-11 rounded-full bg-[#EAE4DC] border border-[#D8CFC4] text-[#3A3733] font-[var(--font-serif)] text-sm cursor-pointer transition-all duration-250 hover:bg-[#5C7350] hover:text-white hover:border-[#5C7350] shadow-md flex items-center justify-center"
        aria-label="Cambiar tamaño de letra"
      >
        {FONT_SIZES[fontSize].label}
      </button>
    </div>
  );

  // ── FOOTER COMPONENT ─────────────────────────

  const Footer = ({ showDemo = false, showCounter = false }: { showDemo?: boolean; showCounter?: boolean }) => (
    <footer className="mt-14 text-center" role="contentinfo">
      <div className={`${S.divider} mb-5`} />
      <p className="font-[var(--font-sans)] text-[0.65rem] text-[#857F78] leading-relaxed">mepesamucho.com · Un espacio de reflexión, no de consejería.</p>
      <p className="font-[var(--font-sans)] text-[0.65rem] text-[#857F78] leading-relaxed mt-1">Lo que escribes no se almacena ni se comparte.</p>
      {showCounter && (
        <p className="font-[var(--font-sans)] text-[0.6rem] text-[#8A8580] mt-3">
          {dayPass.active
            ? `Acceso ampliado activo`
            : `${Math.max(0, 2 - usosHoy)} ${Math.max(0, 2 - usosHoy) === 1 ? "reflexión gratuita disponible" : "reflexiones gratuitas disponibles"} hoy`
          }
        </p>
      )}
      <div className="flex justify-center gap-4 mt-3 flex-wrap">
        <button className={`${S.link} text-[0.65rem]`} onClick={() => setShowAbout(true)}>Acerca de</button>
        <button className={`${S.link} text-[0.65rem]`} onClick={() => setShowDisclaimer(true)}>Aviso legal y privacidad</button>
        {showDemo && (
          <button className={`${S.link} text-[0.65rem]`} onClick={() => { setUsosHoy(0); saveUsosHoy(0); }}>(Demo: reiniciar)</button>
        )}
      </div>
    </footer>
  );

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════

  // ── LIMIT (paywall) ────────────────────────────

  if (usosHoy >= 2 && !dayPass.active && !getSinglePass() && step === "landing") {
    return (
      <div className={`${S.page} animate-fade-in pt-16`} key={fadeKey}>
        <SiteHeader />
        {showDisclaimer && <DisclaimerModal />}
        {showAbout && <AboutModal />}
        <div className={`${S.box} text-center`}>
          {/* Emotional header */}
          <p className="text-xl font-light italic leading-relaxed mb-2">
            Lo que estás tocando merece más espacio.
          </p>
          <p className={`${S.sub} text-base mb-8`}>
            Puedes seguir profundizando ahora mismo.
          </p>

          {/* Single — featured card, solid button */}
          <div className="card-hover-lift bg-[#EAE4DC] border-2 border-[#7A8B6F] rounded-lg p-6 mb-4 text-center">
            <p className="text-lg font-medium mb-1">Continuar conversación actual</p>
            <p className="text-2xl font-light mb-2">$0.50 <span className={`${S.sub} text-sm`}>USD</span></p>
            <p className={`${S.sub} text-sm mb-4`}>Desbloquea esta reflexión completa y continúa tu conversación. Incluye descarga en PDF.</p>
            <button className={`${S.btn} btn-primary-glow w-full`} onClick={() => checkout("single")} aria-label="Desbloquear esta reflexión por $0.50">Desbloquear esta reflexión</button>
          </div>

          {/* Day pass — standard card, outline button */}
          <div className="card-hover-lift border border-[#D8CFC4] rounded-lg p-5 mb-4 text-center">
            <p className="text-base font-medium mb-1">Acceso 24 horas</p>
            <p className="text-xl font-light mb-1">$0.99 <span className={`${S.sub} text-sm`}>USD</span></p>
            <p className={`${S.sub} text-sm mb-3`}>Reflexiones ilimitadas por un día completo. Incluye descarga en PDF de cada reflexión.</p>
            <button className={S.btnSecondary + " w-full"} onClick={() => checkout("daypass")} aria-label="Activar acceso 24 horas por $0.99">Activar acceso 24h</button>
          </div>

          {/* Subscription — discrete card, light outline button */}
          <div className="card-hover-lift border border-[#D8CFC4]/70 rounded-lg p-5 mb-6 text-center">
            <p className="text-base font-medium mb-1">Suscripción mensual</p>
            <p className="text-xl font-light mb-1">$4.99 <span className={`${S.sub} text-sm`}>USD / mes</span></p>
            <p className={`${S.sub} text-sm mb-3`}>Reflexiones ilimitadas, conversaciones guiadas, descarga PDF y acceso desde cualquier dispositivo.</p>
            <button className={`font-[var(--font-serif)] text-base px-7 py-3 bg-transparent text-[#5C5751] border border-[#D8CFC4] rounded-lg cursor-pointer transition-all duration-250 hover:bg-[#EAE4DC] hover:border-[#5C7350] w-full`} onClick={() => checkout("subscription")} aria-label="Suscribirme por $4.99 al mes">Suscribirme</button>
            <p className={`${S.sub} text-xs mt-2`}>Puedes cancelar en cualquier momento.</p>
          </div>

          <p className={`${S.sub} text-xs mb-6`}>Todos los precios en USD. Cobro seguro a través de Stripe.</p>

          {/* Recovery section — below pricing, discrete */}
          <div className="border border-[#D8CFC4] rounded-lg p-5 mb-4">
            <p className="text-sm font-medium mb-1">¿Ya pagaste antes?</p>
            <p className={`${S.sub} text-xs mb-3`}>Recupera tu acceso con el email o código que registraste.</p>
            {!recoveryMode ? (
              <div className="flex gap-2 flex-wrap justify-center">
                <button className={S.btnSm} onClick={() => { setRecoveryMode("email"); setRecoveryInput(""); setRecoveryError(""); }}>
                  Recuperar con email
                </button>
                <button className={S.btnSm} onClick={() => { setRecoveryMode("code"); setRecoveryInput(""); setRecoveryError(""); }}>
                  Recuperar con código
                </button>
              </div>
            ) : (
              <div>
                <label className="sr-only" htmlFor="recovery-input">{recoveryMode === "email" ? "Email de recuperación" : "Código de acceso"}</label>
                <input
                  id="recovery-input"
                  type={recoveryMode === "email" ? "email" : "text"}
                  value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value)}
                  placeholder={recoveryMode === "email" ? "Tu email..." : "MPM-XXXX-XXXX"}
                  className="w-full p-3 font-[var(--font-sans)] text-sm bg-white/60 border border-[#D8CFC4] rounded-lg outline-none mb-2"
                  autoFocus
                  style={recoveryMode === "code" ? { textTransform: "uppercase", letterSpacing: "0.1em" } : undefined}
                />
                {recoveryError && <p className="text-sm text-[#6B7F5E] mb-2" role="alert">{recoveryError}</p>}
                <div className="flex gap-2 justify-center">
                  <button
                    className={`${S.btnSm} ${recoveryLoading ? "opacity-50" : ""}`}
                    disabled={!recoveryInput.trim() || recoveryLoading}
                    onClick={async () => {
                      setRecoveryLoading(true);
                      setRecoveryError("");
                      try {
                        const body = recoveryMode === "email"
                          ? { email: recoveryInput.trim() }
                          : { code: recoveryInput.trim().toUpperCase() };
                        const res = await fetch("/api/recover-access", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(body),
                        });
                        const data = await res.json();
                        if (data.success) {
                          if (data.type === "daypass" && data.expiresAt) {
                            localStorage.setItem("mpm_daypass", JSON.stringify({ expires: data.expiresAt }));
                            setDayPass({ active: true, hoursLeft: data.hoursLeft || 24 });
                          } else if (data.type === "single") {
                            activateSinglePass();
                          } else if (data.type === "subscription") {
                            activateDayPass();
                            setDayPass({ active: true, hoursLeft: 720 });
                          }
                          setUsosHoy(0);
                          saveUsosHoy(0);
                          setRecoveryMode(null);
                          setStep("landing");
                        } else {
                          setRecoveryError(data.error || "No se encontró acceso activo con estos datos.");
                        }
                      } catch {
                        setRecoveryError("Error de conexión. Intenta de nuevo.");
                      }
                      setRecoveryLoading(false);
                    }}
                  >
                    {recoveryLoading ? "Verificando..." : "Verificar acceso"}
                  </button>
                  <button className={`${S.link} text-sm`} onClick={() => setRecoveryMode(null)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>

          <Footer showDemo />
        </div>
      </div>
    );
  }

  // ── LANDING ──────────────────────────────────

  if (step === "landing") {
    return (
      <div className={`${S.page}`} key={fadeKey} style={{ paddingBottom: "6vh" }}>
        {showDisclaimer && <DisclaimerModal />}
        {showAbout && <AboutModal />}

        {/* Capa ambiental — silencio digital con textura */}
        <div className="ambient-layer" />
        {/* Línea de anclaje lateral */}
        <div className="accent-line" />

        <div className={`${S.box} text-center`} style={{ position: "relative", zIndex: 1 }}>
          <div className="flex justify-center mb-12 hero-stagger-1 icon-breathe"><LogoIcon size={44} /></div>

          <p className="text-2xl sm:text-3xl text-[#5C5751] italic leading-relaxed font-light mb-14 hero-stagger-2" style={{ letterSpacing: "-0.01em" }}>
            A veces las cosas pesan menos cuando las sueltas.
          </p>

          <button className={`${S.btn} text-lg px-10 py-4 hero-stagger-3`} onClick={() => setStep("writing")} aria-label="Comenzar a escribir">
            Quiero soltar lo que cargo
          </button>

          {/* Discrete "¿Cómo funciona?" link below CTA */}
          <div className="mt-8 hero-stagger-4 text-center">
            <button
              className="font-[var(--font-sans)] text-xs text-[#857F78] font-light cursor-pointer bg-transparent border-none underline decoration-[#D8CFC4] underline-offset-4 hover:text-[#5C7350] transition-colors mx-auto"
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              aria-expanded={showHowItWorks}
              aria-controls="how-it-works"
            >
              ¿Cómo funciona?
            </button>
          </div>

          {/* Accordion content — expands below */}
          <div
            id="how-it-works"
            style={{
              maxHeight: showHowItWorks ? "280px" : "0",
              opacity: showHowItWorks ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
            }}
          >
            <div className="mt-8 pt-6" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#E8E2DB" }}>
              <div className="text-left max-w-[380px] mx-auto space-y-5">
                <div className="flex items-start gap-4">
                  <span className="font-[var(--font-sans)] text-[0.65rem] text-[#857F78] font-light mt-0.5 flex-shrink-0 tabular-nums">1</span>
                  <p className={`${S.sub} text-sm leading-relaxed`}>Escribes lo que necesitas soltar</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-[var(--font-sans)] text-[0.65rem] text-[#857F78] font-light mt-0.5 flex-shrink-0 tabular-nums">2</span>
                  <p className={`${S.sub} text-sm leading-relaxed`}>Eliges desde qué tradición quieres recibir la reflexión</p>
                </div>
                <div className="flex items-start gap-4">
                  <span className="font-[var(--font-sans)] text-[0.65rem] text-[#857F78] font-light mt-0.5 flex-shrink-0 tabular-nums">3</span>
                  <p className={`${S.sub} text-sm leading-relaxed`}>Recibes una reflexión escrita especialmente para ti</p>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-stagger-5">
            <Footer showCounter />
          </div>
        </div>
      </div>
    );
  }

  // ── WRITING (centered vertically) ─────────────

  if (step === "writing") {
    return (
      <div className={`${S.page} animate-fade-in pt-16`} key={fadeKey}>
        <SiteHeader />
        {showCrisis && <CrisisModal />}
        {showCrisisBanner && <CrisisBanner />}
        {showDisclaimer && <DisclaimerModal />}
        {showAbout && <AboutModal />}
        <div className={`${S.box}`}>
          <PrivacyBadge onClick={() => setShowDisclaimer(true)} />
          <div className="h-4" />
          <label htmlFor="texto-principal" className="sr-only">Escribe lo que necesitas soltar</label>
          <textarea
            id="texto-principal"
            value={texto}
            onChange={handleTextoChange}
            placeholder="Escribe aquí lo que necesitas soltar..."
            autoFocus
            className={S.textareaLg}
            aria-label="Escribe lo que necesitas soltar"
          />
          <p className={`${S.sub} text-xs text-right mt-1`}>{texto.length > 0 ? `${texto.length} caracteres` : ""}</p>
          {texto.trim().length > 0 && (
            <div className="text-center mt-5 transition-opacity duration-500" style={{ opacity: texto.trim().length > 5 ? 1 : 0.5 }}>
              <button className={`${S.btn} text-lg px-10`} onClick={iniciarDisolucion} aria-label="Soltar lo que escribiste">
                Soltar y dejar ir
              </button>
              <p className={`${S.sub} text-xs mt-3`}>Tu texto se procesa en el momento y luego se elimina.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── DISSOLVING ───────────────────────────────

  if (step === "dissolving") {
    return (
      <div className={S.page}>
        {showCrisisBanner && <CrisisBanner />}
        {showCrisis && <CrisisModal />}
        <div className={`${S.box} text-left`}>
          <div className="animate-dissolve text-lg leading-relaxed p-5 whitespace-pre-wrap break-words max-h-[60vh] overflow-hidden" aria-live="polite">
            {texto}
          </div>
        </div>
      </div>
    );
  }

  // ── MESSAGE (with manual continue button) ──────

  if (step === "message") {
    return (
      <div className={S.page}>
        {showCrisisBanner && <CrisisBanner />}
        {showCrisis && <CrisisModal />}
        <div className={`${S.box} text-center`}>
          <p
            className="text-2xl text-[#5C5751] italic font-light transition-all duration-[1200ms] mb-8"
            style={{ opacity: msgOpacity, transform: msgOpacity === 0 ? "translateY(12px)" : "translateY(0)" }}
            aria-live="polite"
          >
            Ya no lo cargas solo.
          </p>
          {readyContinue && (
            <div className="animate-fade-in">
              <button
                className={S.btnSecondary}
                onClick={() => setStep("framework")}
                aria-label="Continuar al siguiente paso"
              >
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── FRAMEWORK ────────────────────────────────

  if (step === "framework") {
    return (
      <div className={`${S.page} animate-fade-in pt-16`} key={fadeKey}>
        <SiteHeader />
        {showCrisisBanner && <CrisisBanner />}
        {showCrisis && <CrisisModal />}
        {showDisclaimer && <DisclaimerModal />}
        {showAbout && <AboutModal />}
        <div className={`${S.box} text-center`}>
          <p className={`${S.sub} text-sm mb-2`}>Ahora elige cómo quieres escucharte.</p>
          <h2 className="text-xl font-normal italic leading-snug mb-8">¿Desde qué tradición quieres recibir tu reflexión?</h2>
          {apiError && <p className={`${S.sub} text-sm text-[#6B7F5E] mb-4`} role="alert">{apiError}</p>}
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Selecciona tradición">
            {(Object.entries(MARCOS) as [Marco, { nombre: string; descripcion: string }][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setMarco(key); setPreguntaStep(0); setStep("preguntas"); }}
                className="text-left p-5 bg-transparent border-2 border-[#D8CFC4] rounded-lg transition-all duration-250 hover:bg-[#EAE4DC] hover:border-[#5C7350] hover:shadow-sm cursor-pointer group"
                role="radio"
                aria-checked="false"
                aria-label={`${val.nombre}: ${val.descripcion}`}
              >
                <span className="block text-lg font-medium group-hover:text-[#3A3733]">{val.nombre}</span>
                <span className={`block ${S.sub} text-sm mt-1`}>{val.descripcion}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PREGUNTAS (with contextual guide) ─────────

  if (step === "preguntas") {
    const isQ1 = preguntaStep === 0;
    const val = isQ1 ? resp1 : resp2;
    const handleChange = isQ1 ? handleResp1Change : handleResp2Change;

    const handleContinue = () => {
      if (crisisDetectedInText && !crisisAck) {
        setShowCrisis(true);
        return;
      }
      if (isQ1) {
        setPreguntaStep(1);
      } else {
        generarReflexion();
      }
    };

    const placeholderQ1 = "Por ejemplo: necesito paz, quiero entender por qué me siento así";
    const placeholderQ2 = "Por ejemplo: viene de hace mucho, pero hoy regresó; pasó ayer";
    const whyQ1 = "Esto nos ayuda a centrar tu reflexión en lo que más importa ahora mismo.";
    const whyQ2 = "Saber si es algo reciente o de tiempo atrás nos ayuda a encontrar las palabras correctas para ti.";

    return (
      <div className={`${S.page} animate-fade-in pt-16`} key={`q${fadeKey}`}>
        <SiteHeader />
        {showCrisisBanner && <CrisisBanner />}
        {showCrisis && <CrisisModal />}
        {showDisclaimer && <DisclaimerModal />}
        {showAbout && <AboutModal />}
        <div className={`${S.box} text-center`}>
          <h2 className="text-2xl font-light italic leading-relaxed mb-4">
            {isQ1 ? "¿Qué es lo que más necesitas en este momento?" : "¿Esto que te pesa viene de hace tiempo o es reciente?"}
          </h2>
          <p className={`${S.sub} text-sm mb-8 text-center leading-relaxed`}>{isQ1 ? whyQ1 : whyQ2}</p>

          <label htmlFor={`pregunta-${isQ1 ? "1" : "2"}`} className="sr-only">
            {isQ1 ? "Qué necesitas en este momento" : "Desde cuándo te pesa esto"}
          </label>
          <textarea
            id={`pregunta-${isQ1 ? "1" : "2"}`}
            value={val}
            onChange={handleChange}
            placeholder={isQ1 ? placeholderQ1 : placeholderQ2}
            autoFocus
            className={S.textarea}
            aria-label={isQ1 ? "Tu respuesta sobre lo que necesitas" : "Tu respuesta sobre la duración"}
          />
          <div className="mt-6">
            <button
              disabled={!val.trim()}
              onClick={handleContinue}
              className={`${S.btn} ${!val.trim() ? "opacity-30 cursor-default" : ""}`}
              aria-label={isQ1 ? "Continuar a la siguiente pregunta" : "Generar mi reflexión"}
            >
              {isQ1 ? "Continuar" : "Generar mi reflexión"}
            </button>
          </div>

          <div className="mt-6">
            <PrivacyBadge onClick={() => setShowDisclaimer(true)} />
          </div>
        </div>
      </div>
    );
  }

  // ── GENERATING (rotating messages) ──────────

  if (step === "generating") {
    return (
      <div className={S.page}>
        {showCrisisBanner && <CrisisBanner />}
        <div className={`${S.box} text-center flex flex-col items-center`}>
          <div className="relative mb-8">
            <div className="w-16 h-16 rounded-full bg-[#7A8B6F]/20 animate-breathe-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#7A8B6F]/30 animate-breathe" />
            </div>
          </div>
          <p className={`${S.sub} italic text-base animate-gen-fade`} key={genMsgIndex} aria-live="polite">
            {GEN_MESSAGES[genMsgIndex]}
          </p>
          <p className={`${S.sub} text-xs mt-4`}>
            Esto puede tomar unos segundos
          </p>
        </div>
      </div>
    );
  }

  // ── ESSAY + CIERRE (clean separated screens) ────

  // Helper: render paragraphs with formatting
  const renderParagraphs = (text: string, baseSize: string = "1.2rem") => {
    const cleanMarkdown = (t: string): string => t.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
    return text.split("\n\n").map((p, i) => {
      const t = p.trim();
      if (!t) return null;
      const headerMatch = t.match(/^#{1,3}\s+(.+)$/);
      if (headerMatch) return <h2 key={i} className="text-center font-light italic mb-6 mt-2 text-[#6F6A64]" style={{ fontSize: fs.xl }}>{cleanMarkdown(headerMatch[1])}</h2>;
      const cleaned = cleanMarkdown(t);
      const isCita = cleaned.startsWith("<<") || cleaned.startsWith("\u00AB") || cleaned.startsWith('"');
      const isAttrib = cleaned.startsWith("\u2014") || cleaned.startsWith("--");
      const isQ = cleaned.endsWith("?") && cleaned.length < 200;
      if (isCita) return <blockquote key={i} className="my-8 py-5 px-6 bg-[#EAE4DC]/50 rounded-r-md italic leading-loose" style={{ fontSize: fs.cita, borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#7A8B6F" }}>{cleaned}</blockquote>;
      if (isAttrib) return <p key={i} className={`${S.sub} text-sm pl-6 mb-6 font-medium`}>{cleaned}</p>;
      if (isQ) return <p key={i} className="my-8 italic text-[#6B7F5E] text-center leading-relaxed" style={{ fontSize: fs.lg }}>{cleaned}</p>;
      return <p key={i} className="mb-5 text-justify leading-loose" style={{ fontSize: baseSize }}>{cleaned}</p>;
    });
  };

  // Essay page — main reflection (cierreStep 0 = reading, click "Quiero responder" goes to cierreStep 1)
  if (step === "essay" && cierreStep <= 0) {
    return (
      <div className={`min-h-screen bg-[#F3EFEA] text-[#3A3733] font-[var(--font-serif)] animate-fade-in`} key={fadeKey}>
        {showDisclaimer && <DisclaimerModal />}
        {showAbout && <AboutModal />}
        {showCrisis && <CrisisModal />}
        {showCrisisBanner && <CrisisBanner />}
        {showFuentes && <FuentesModal />}
        <FontSizeToggle />

        <div className="flex flex-col items-center pt-8 pb-3 sm:pt-10 sm:pb-4" style={{ minHeight: "14vh" }}>
          <div className="flex flex-col items-center justify-end flex-1 pb-3">
            <button onClick={reiniciar} className="flex flex-col items-center bg-transparent border-none cursor-pointer" aria-label="Volver al inicio">
              <LogoIcon size={28} />
              <p className="text-lg sm:text-xl font-light tracking-tight mt-2 text-[#3A3733]/80">mepesamucho</p>
            </button>
            <div className="w-10 h-px bg-[#7A8B6F] mt-3 mb-2" />
            <p className="font-[var(--font-sans)] text-xs uppercase tracking-[0.2em] text-[#6F6A64] font-light">{MARCOS[marco!]?.nombre}</p>
          </div>
        </div>

        <div className="text-center mb-4 px-5">
          <p className="font-[var(--font-sans)] text-sm sm:text-base italic text-[#6B7F5E] font-light tracking-wide">Lee despacio. Esto fue escrito para ti.</p>
        </div>

        <div style={{ maxWidth: "680px", width: "100%", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingBottom: "3rem" }}>
          <div className={`relative ${showScrollHint ? "scroll-hint-bottom" : ""}`}>
            <div ref={scrollCardRef} className="bg-white/40 border border-[#D8CFC4] rounded-lg p-6 sm:p-8" style={{ maxHeight: "60vh", overflowY: "auto" }} role="article" aria-label="Tu reflexión personalizada">
              <div className="leading-loose" style={{ maxWidth: "600px", margin: "0 auto" }}>{renderParagraphs(reflexion)}</div>
            </div>
          </div>

          {/* Primary CTA: Invitation to respond — big and prominent */}
          <div className="mt-8 py-6 text-center" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#D8CFC4" }}>
            <p className="text-lg italic leading-relaxed mb-5">{PREGUNTAS_CIERRE[cIdx]}</p>
            <button className={`${S.btn} text-lg px-10 py-4`} onClick={() => { setShowCierreInput(true); setCierreStep(1); }} aria-label="Responder a la reflexión">
              Quiero responder
            </button>
          </div>

          {/* Secondary: Download PDF — corner-like, lower hierarchy */}
          <div className="text-center mt-4">
            <button
              className={`${S.link} text-sm`}
              onClick={() => descargarReflexionPDF(reflexion, citasUsadas, MARCOS[marco!]?.nombre || "", resp1)}
              aria-label="Descargar reflexión en formato PDF"
            >
              Descargar reflexión (PDF)
            </button>
          </div>

          <div className="text-center mt-6">
            <button onClick={reiniciar} className={`${S.link} underline underline-offset-4 decoration-[#7A8B6F] text-sm`}>Volver cuando lo necesite</button>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // Cierre step 1 — clean centered screen for first answer
  if (step === "essay" && cierreStep === 1) {
    return (
      <div className={`${S.page} animate-fade-in pt-16`} key={`c1-${fadeKey}`}>
        <SiteHeader />
        {showCrisis && <CrisisModal />}
        {showCrisisBanner && <CrisisBanner />}
        <div className={`${S.box} text-center`}>
          <h2 className="text-2xl font-light italic leading-relaxed mb-8">{PREGUNTAS_CIERRE[cIdx]}</h2>
          <label htmlFor="cierre-resp" className="sr-only">Responder reflexión</label>
          <textarea id="cierre-resp" value={cierreTexto} onChange={handleCierreTextoChange} placeholder="Escribe lo que quieras..." autoFocus className={S.textarea} aria-label="Responder reflexión" />
          <div className="mt-5 flex flex-col items-center gap-4">
            {cierreTexto.trim() && <button className={S.btn} onClick={() => setCierreStep(2)}>Compartir</button>}
            <button className={`${S.link} text-sm`} onClick={() => { setCierreStep(0); setShowCierreInput(false); }}>Volver a mi reflexión</button>
          </div>
        </div>
      </div>
    );
  }

  // Cierre step 2 — profundización + second question (clean screen)
  if (step === "essay" && cierreStep === 2) {
    return (
      <div className={`${S.page} animate-fade-in pt-16`} key={`c2-${fadeKey}`}>
        <SiteHeader />
        {showCrisis && <CrisisModal />}
        {showCrisisBanner && <CrisisBanner />}
        <div className={`${S.box}`}>
          <p className="italic text-[#6F6A64] mb-6 pl-5 leading-loose" style={{ borderLeftWidth: "2px", borderLeftStyle: "solid", borderLeftColor: "#D8CFC4", fontSize: "1.2rem" }}>{cierreTexto}</p>
          <p className="leading-loose mb-6" style={{ fontSize: "1.2rem" }}>{PROFUNDIZACIONES[cIdx]}</p>
          <h2 className="text-xl italic text-center leading-relaxed mb-6">{PREGUNTAS_SEGUNDO[cIdx]}</h2>
          <label htmlFor="cierre-resp2" className="sr-only">Responder reflexión</label>
          <textarea id="cierre-resp2" value={cierreTexto2} onChange={handleCierreTexto2Change} placeholder="Escribe lo que quieras..." autoFocus className={S.textarea} aria-label="Responder reflexión" />
          <div className="mt-5 flex flex-col items-center gap-4">
            {cierreTexto2.trim() && <button className={S.btn} onClick={() => { setCierreStep(3); generarContinuacion(); }}>Continuar</button>}
            <button className={`${S.link} text-sm`} onClick={() => setCierreStep(1)}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  // Cierre step 3 — generating continuation (clean centered, like "generating")
  if (step === "essay" && cierreStep === 3 && continuacionLoading) {
    return (
      <div className={S.page}>
        {showCrisisBanner && <CrisisBanner />}
        <div className={`${S.box} text-center flex flex-col items-center`}>
          <div className="relative mb-8">
            <div className="w-16 h-16 rounded-full bg-[#7A8B6F]/20 animate-breathe-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#7A8B6F]/30 animate-breathe" />
            </div>
          </div>
          <p className={`${S.sub} italic text-base`}>Preparando algo más para ti...</p>
          <p className={`${S.sub} text-xs mt-4`}>Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  // Cierre step 3 — continuation ready (censored or unlocked) — in a clean card
  if (step === "essay" && cierreStep === 3 && !continuacionLoading) {
    const paragraphs = continuacion ? continuacion.split("\n\n").filter((p: string) => p.trim()) : [];
    const visibleParagraphs = paragraphs.slice(0, 2);
    const censoredParagraphs = paragraphs.slice(2);

    // If no continuacion generated, show fallback paywall
    if (!continuacion) {
      return (
        <div className={`${S.page} animate-fade-in pt-16`} key={`c3f-${fadeKey}`}>
          <SiteHeader />
          <div className={`${S.box} text-center`}>
            <p className="text-xl italic leading-relaxed mb-2">Lo que estás tocando merece más espacio.</p>
            <p className={`${S.sub} text-base mb-6`}>Puedes seguir profundizando ahora mismo.</p>
            <div className="flex flex-col gap-3 items-center max-w-[380px] mx-auto">
              <button className={`${S.btn} btn-primary-glow w-full`} onClick={() => checkout("single")} aria-label="Desbloquear por $0.50">Continuar conversación — $0.50</button>
              <button className={`${S.btnSecondary} w-full text-sm`} onClick={() => checkout("daypass")} aria-label="Acceso 24h por $0.99">Acceso 24h — $0.99</button>
              <button className={`${S.sub} text-xs cursor-pointer bg-transparent border-none hover:text-[#5C7350] transition-colors`} onClick={() => checkout("subscription")} aria-label="Suscripción mensual $4.99">Suscripción mensual · $4.99/mes</button>
            </div>
            <div className="mt-6"><button className={`${S.link} text-sm`} onClick={() => setCierreStep(0)}>Volver a mi reflexión</button></div>
          </div>
        </div>
      );
    }

    return (
      <div className={`min-h-screen bg-[#F3EFEA] text-[#3A3733] font-[var(--font-serif)] animate-fade-in`} key={`c3-${fadeKey}`}>
        <SiteHeader />
        {showDisclaimer && <DisclaimerModal />}
        {showCrisis && <CrisisModal />}
        {showCrisisBanner && <CrisisBanner />}

        <div style={{ maxWidth: "680px", width: "100%", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingTop: "5rem", paddingBottom: "3rem" }}>

          {/* Continuation card */}
          <div className="bg-white/40 border border-[#D8CFC4] rounded-lg p-6 sm:p-8">
            <div className="leading-loose">
              {/* Visible paragraphs */}
              {visibleParagraphs.map((p: string, i: number) => {
                const t = p.trim();
                const isCita = t.startsWith("<<") || t.startsWith("\u00AB") || t.startsWith('"');
                const isAttrib = t.startsWith("\u2014") || t.startsWith("--");
                if (isCita) return <blockquote key={i} className="my-6 py-4 px-5 bg-[#EAE4DC]/50 rounded-r-md italic leading-loose" style={{ fontSize: "1.1rem", borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#7A8B6F" }}>{t}</blockquote>;
                if (isAttrib) return <p key={i} className={`${S.sub} text-sm pl-5 mb-5 font-medium`}>{t}</p>;
                return <p key={i} className="mb-5 text-justify leading-loose" style={{ fontSize: "1.2rem" }}>{t}</p>;
              })}

              {/* Censored or unlocked */}
              {continuacionDesbloqueada ? (
                <>
                  {censoredParagraphs.map((p: string, i: number) => {
                    const t = p.trim();
                    const isCita = t.startsWith("<<") || t.startsWith("\u00AB") || t.startsWith('"');
                    const isAttrib = t.startsWith("\u2014") || t.startsWith("--");
                    if (isCita) return <blockquote key={`u${i}`} className="my-6 py-4 px-5 bg-[#EAE4DC]/50 rounded-r-md italic leading-loose" style={{ fontSize: "1.1rem", borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#7A8B6F" }}>{t}</blockquote>;
                    if (isAttrib) return <p key={`u${i}`} className={`${S.sub} text-sm pl-5 mb-5 font-medium`}>{t}</p>;
                    return <p key={`u${i}`} className="mb-5 text-justify leading-loose" style={{ fontSize: "1.2rem" }}>{t}</p>;
                  })}
                </>
              ) : (
                <>
                  {/* Blurred with paywall overlay inside the card */}
                  <div className="reflection-censored" style={{ minHeight: "200px" }}>
                    <div className="censored-blur">
                      {censoredParagraphs.map((p: string, i: number) => (
                        <p key={`b${i}`} className="mb-5 text-justify leading-loose" style={{ fontSize: "1.2rem" }}>{p.trim()}</p>
                      ))}
                    </div>
                    <div className="censored-overlay">
                      <div className="bg-[#F3EFEA] border border-[#D8CFC4] rounded-lg p-6 mx-4 mb-4 text-center" style={{ width: "calc(100% - 2rem)", maxWidth: "400px" }}>
                        <p className="text-lg italic leading-relaxed mb-1">Desbloquear la reflexión completa</p>
                        <p className={`${S.sub} text-sm mb-4`}>Lo que estás tocando merece más espacio.</p>
                        <button className={`${S.btn} btn-primary-glow w-full mb-3`} onClick={() => checkout("single")} aria-label="Desbloquear por $0.50">Continuar conversación — $0.50</button>
                        <button className={`${S.btnSecondary} w-full mb-2 text-sm`} onClick={() => checkout("daypass")} aria-label="Acceso 24h por $0.99">Acceso 24h — $0.99</button>
                        <button className={`${S.sub} text-xs cursor-pointer bg-transparent border-none hover:text-[#5C7350] transition-colors block mx-auto`} onClick={() => checkout("subscription")} aria-label="Suscripción mensual $4.99">Suscripción mensual · $4.99/mes</button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Dialog section (only when unlocked) */}
          {continuacionDesbloqueada && (
            <div className="mt-8 pt-6" style={{ borderTopWidth: "1px", borderTopStyle: "solid", borderTopColor: "#D8CFC4" }}>
              {dialogTurnos.map((turno, i) => (
                <div key={i} className={`mb-5 animate-fade-in ${turno.role === "user" ? "text-right" : "text-left"}`}>
                  {turno.role === "user" ? (
                    <div className="inline-block text-left bg-[#EAE4DC]/60 rounded-lg p-4 max-w-[85%]">
                      <p className="text-[0.95rem] leading-relaxed">{turno.content}</p>
                    </div>
                  ) : (
                    <div className="max-w-[95%]">
                      {turno.content.split("\n\n").map((p, j) => {
                        const t = p.trim();
                        if (!t) return null;
                        const isCita = t.startsWith("<<") || t.startsWith("\u00AB") || t.startsWith('"');
                        const isAttrib = t.startsWith("\u2014") || t.startsWith("--");
                        if (isCita) return <blockquote key={j} className="my-4 py-3 px-4 bg-[#EAE4DC]/40 rounded-r-md italic text-[0.95rem] leading-relaxed" style={{ borderLeftWidth: "2px", borderLeftStyle: "solid", borderLeftColor: "#7A8B6F" }}>{t}</blockquote>;
                        if (isAttrib) return <p key={j} className={`${S.sub} text-xs pl-4 mb-3 font-medium`}>{t}</p>;
                        return <p key={j} className="mb-3 text-[0.95rem] leading-relaxed">{t}</p>;
                      })}
                    </div>
                  )}
                </div>
              ))}

              {dialogLoading && (
                <div className="mb-5 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#7A8B6F] animate-pulse-slow" />
                  <div className="w-2 h-2 rounded-full bg-[#7A8B6F] animate-pulse-slow" style={{ animationDelay: "0.3s" }} />
                  <div className="w-2 h-2 rounded-full bg-[#7A8B6F] animate-pulse-slow" style={{ animationDelay: "0.6s" }} />
                </div>
              )}

              <div ref={dialogEndRef} />

              {dialogCerrado ? (
                <div className="text-center animate-fade-in mt-6">
                  <div className="w-10 h-px bg-[#7A8B6F] mx-auto mb-5" />
                  <p className="text-lg italic mb-2">Gracias por este momento.</p>
                  <p className={`${S.sub} text-sm mb-6`}>Aquí están todas las fuentes que acompañaron tu reflexión.</p>
                  <div className="text-left">
                    {allCitas.map((c, i) => (
                      <div key={i} className="mb-4 pl-4" style={{ borderLeftWidth: "2px", borderLeftStyle: "solid", borderLeftColor: "#D8CFC4" }}>
                        <p className="text-sm font-medium mb-0.5">{c.source}</p>
                        <p className={`${S.sub} text-sm italic leading-snug`}>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <label htmlFor="dialog-input" className="sr-only">Responder reflexión</label>
                  <textarea
                    id="dialog-input"
                    value={dialogInput}
                    onChange={(e) => { setDialogInput(e.target.value); checkCrisisInText(e.target.value); }}
                    placeholder="Escribe lo que quieras..."
                    className={S.textarea}
                    aria-label="Responder reflexión"
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && dialogInput.trim()) { e.preventDefault(); enviarDialogo(dialogInput); } }}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <button
                      className={`${S.btn} text-[0.95rem] px-6 py-2.5 ${!dialogInput.trim() || dialogLoading ? "opacity-40 cursor-default" : ""}`}
                      disabled={!dialogInput.trim() || dialogLoading}
                      onClick={() => enviarDialogo(dialogInput)}
                    >
                      {dialogLoading ? "..." : "Responder"}
                    </button>
                    {dialogTurnos.length >= 2 && (
                      <button className={`${S.link} text-sm`} onClick={cerrarDialogo}>Cerrar conversación</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="text-center mt-8 flex flex-col items-center gap-3">
            <button className={`${S.link} text-sm`} onClick={() => setCierreStep(0)}>Volver a mi reflexión anterior</button>
            <button onClick={reiniciar} className={`${S.link} underline underline-offset-4 decoration-[#7A8B6F] text-sm`}>Volver al inicio</button>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  // ── ACCESS CHOICE (post-payment) ──────────────

  if (step === "access_choice") {
    const handleSaveWithEmail = async () => {
      if (!accessEmail.trim()) return;
      setAccessSaving(true);
      setAccessError("");
      try {
        const res = await fetch("/api/save-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: lastSessionId, method: "email", email: accessEmail.trim() }),
        });
        const data = await res.json();
        if (data.success) {
          setAccessDone(true);
        } else {
          setAccessError(data.error || "Error al guardar.");
        }
      } catch {
        setAccessError("Error de conexión.");
      }
      setAccessSaving(false);
    };

    const handleSaveWithCode = async () => {
      setAccessSaving(true);
      setAccessError("");
      try {
        const res = await fetch("/api/save-access", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: lastSessionId, method: "code" }),
        });
        const data = await res.json();
        if (data.success && data.code) {
          setAccessCode(data.code);
          setAccessDone(true);
        } else {
          setAccessError(data.error || "Error al generar código.");
        }
      } catch {
        setAccessError("Error de conexión.");
      }
      setAccessSaving(false);
    };

    const copyCode = () => {
      navigator.clipboard.writeText(accessCode).catch(() => {});
    };

    return (
      <div className={`${S.page} animate-fade-in`} key={fadeKey}>
        <div className={`${S.box} text-center`}>
          <div className={`${S.divider} mb-6`} style={{ width: 40 }} />

          {!accessDone ? (
            <>
              <h2 className="text-xl font-light mb-2">¡Pago confirmado!</h2>
              <p className={`${S.subStrong} text-base mb-2`}>
                Guarda tu acceso para recuperarlo desde cualquier dispositivo.
              </p>
              <p className={`${S.sub} text-sm mb-6 bg-[#F5ECE3] rounded-lg p-3`}>
                &#9888; Si no guardas tu acceso ahora, solo funcionará en este navegador. No podrás recuperarlo después sin este paso.
              </p>

              {accessError && <p className="text-sm text-[#6B7F5E] mb-4" role="alert">{accessError}</p>}

              {/* Option 1: Email */}
              <div className="border border-[#D8CFC4] rounded-lg p-5 mb-4 text-left">
                <p className="text-[1.05rem] font-medium mb-1">Guardar con mi email</p>
                <p className={`${S.sub} text-sm mb-3`}>Más cómodo. Recupera tu acceso desde cualquier dispositivo.</p>
                <label htmlFor="access-email" className="sr-only">Tu email</label>
                <input
                  id="access-email"
                  type="email"
                  value={accessEmail}
                  onChange={(e) => setAccessEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full p-3 font-[var(--font-sans)] text-sm bg-transparent border border-[#D8CFC4] rounded-lg outline-none mb-2"
                />
                <button
                  className={`${S.btn} w-full ${accessSaving ? "opacity-50" : ""}`}
                  disabled={!accessEmail.trim() || accessSaving}
                  onClick={handleSaveWithEmail}
                >
                  {accessSaving ? "Guardando..." : "Guardar con email"}
                </button>
                <p className={`${S.sub} text-xs mt-2`}>Tu email se almacena como hash encriptado. Nunca lo veremos.</p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-[#D8CFC4]" />
                <span className={`${S.sub} text-sm`}>o</span>
                <div className="flex-1 h-px bg-[#D8CFC4]" />
              </div>

              {/* Option 2: Anonymous code */}
              <div className="border border-[#D8CFC4] rounded-lg p-5 mb-4 text-left">
                <p className="text-[1.05rem] font-medium mb-1">Guardar con código anónimo</p>
                <p className={`${S.sub} text-sm mb-3`}>Más privado. Se genera un código único que solo tú conocerás.</p>
                <button
                  className={`${S.btnSecondary} w-full ${accessSaving ? "opacity-50" : ""}`}
                  disabled={accessSaving}
                  onClick={handleSaveWithCode}
                >
                  {accessSaving ? "Generando..." : "Generar código anónimo"}
                </button>
              </div>

              {/* Skip */}
              <button
                className={`${S.link} text-sm mt-4`}
                onClick={() => setStep("landing")}
              >
                Omitir por ahora (solo guardado en este navegador)
              </button>
            </>
          ) : accessCode ? (
            <>
              <h2 className="text-xl font-light mb-2">Tu código de acceso</h2>
              <p className={`${S.sub} text-sm mb-6`}>
                Guarda este código en un lugar seguro. Es tu única forma de recuperar tu acceso desde otro dispositivo.
              </p>
              <div className="bg-[#EAE4DC] border border-[#D8CFC4] rounded-lg p-6 mb-4">
                <p className="font-mono text-2xl tracking-[0.15em] text-[#3A3733] select-all">{accessCode}</p>
              </div>
              <button className={S.btnSm} onClick={copyCode} style={{ marginBottom: "1rem" }}>
                Copiar código
              </button>
              <br />
              <button className={S.btn} onClick={() => setStep("landing")}>
                Continuar
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-light mb-2">Acceso guardado</h2>
              <p className={`${S.sub} text-base mb-6`}>
                Tu acceso queda vinculado a tu email. Cuando necesites recuperarlo, solo ingresa el mismo email.
              </p>
              <button className={S.btn} onClick={() => setStep("landing")}>
                Continuar
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
