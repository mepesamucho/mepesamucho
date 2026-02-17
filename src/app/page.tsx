"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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

// ── CHECKOUT HELPER ────────────────────────────

async function checkout(type: "subscription" | "daypass" | "single") {
  try {
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
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14 34c-2-1-4-3-5-6-1-2-1-4 0-6l3-5c1-1 2-2 3-1l1 2 1-4c0-2 1-3 2-3s2 1 2 3l0 3 1-5c0-2 1-3 2-3s2 1 2 3l-1 6"
      stroke="#C4B6A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
    <path
      d="M34 34c2-1 4-3 5-6 1-2 1-4 0-6l-3-5c-1-1-2-2-3-1l-1 2-1-4c0-2-1-3-2-3s-2 1-2 3l0 3-1-5c0-2-1-3-2-3s-2 1-2 3l1 6"
      stroke="#C4B6A5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
    <path d="M14 34c3 3 7 4 10 4s7-1 10-4" stroke="#C4B6A5" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

// ── FONT SIZE BUTTON ──────────────────────────

const FONT_SIZES = [
  { label: "A", base: "1.1rem", lg: "1.2rem", xl: "1.3rem", cita: "1.25rem" },
  { label: "A+", base: "1.25rem", lg: "1.35rem", xl: "1.45rem", cita: "1.4rem" },
  { label: "A++", base: "1.4rem", lg: "1.5rem", xl: "1.6rem", cita: "1.55rem" },
];

// ── SHARED STYLES ──────────────────────────────
// Color theory: bg #F3EFEA (luminance ~0.87)
// #3A3733 = primary text (ratio ~12:1 ✓ AAA)
// #5C5751 = strong secondary (ratio ~6:1 ✓ AA)
// #6F6A64 = secondary text (ratio ~4.5:1 ✓ AA)
// #857F78 = tertiary text (ratio ~3.2:1 ✓ AA large)
// NEVER use opacity on text — kills contrast

const S = {
  page: "min-h-screen bg-[#F3EFEA] text-[#3A3733] font-[var(--font-serif)] flex flex-col items-center justify-center px-5 py-8 leading-relaxed",
  pageTop: "min-h-screen bg-[#F3EFEA] text-[#3A3733] font-[var(--font-serif)] flex flex-col items-center justify-start px-5 pt-14 pb-12 leading-relaxed",
  box: "max-w-[640px] w-full",
  boxWide: "max-w-[800px] w-full",
  btn: "font-[var(--font-serif)] text-base px-7 py-3 bg-[#EAE4DC] text-[#3A3733] border border-[#D8CFC4] rounded cursor-pointer transition-all duration-300 hover:bg-[#C4B6A5] hover:text-white hover:border-[#C4B6A5]",
  btnSm: "font-[var(--font-serif)] text-sm px-5 py-2 bg-[#EAE4DC] text-[#3A3733] border border-[#D8CFC4] rounded cursor-pointer transition-all duration-300 hover:bg-[#C4B6A5] hover:text-white hover:border-[#C4B6A5]",
  sub: "font-[var(--font-sans)] text-[#6F6A64] font-light leading-relaxed",
  subStrong: "font-[var(--font-sans)] text-[#5C5751] font-light leading-relaxed",
  link: "font-[var(--font-sans)] text-[#6F6A64] font-light text-xs cursor-pointer underline decoration-[#D8CFC4] underline-offset-4 hover:text-[#C4B6A5] transition-colors bg-transparent border-none",
  textarea: "w-full min-h-[120px] p-4 font-[var(--font-serif)] text-[1.1rem] leading-relaxed bg-transparent border border-[#D8CFC4] rounded resize-y outline-none text-left",
  textareaLg: "w-full min-h-[240px] p-5 font-[var(--font-serif)] text-lg leading-relaxed bg-transparent border border-[#D8CFC4] rounded resize-y outline-none",
  divider: "w-8 h-px bg-[#C4B6A5] mx-auto",
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
  const crisisShownOnce = useRef(false);

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
            // Activate localStorage as before
            if (type === "daypass") { activateDayPass(); setDayPass({ active: true, hoursLeft: 24 }); }
            if (type === "single") activateSinglePass();
            if (type === "subscription") { activateDayPass(); setDayPass({ active: true, hoursLeft: 720 }); }
            window.history.replaceState({}, "", "/");
            // Show access choice step
            setLastSessionId(sid);
            setLastPaymentType(type);
            setStep("access_choice");
          }
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => { setFadeKey((k) => k + 1); }, [step, preguntaStep, cierreStep]);

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
    setTimeout(() => {
      setStep("message");
      setMsgOpacity(0);
      setTimeout(() => setMsgOpacity(1), 100);
      setTimeout(() => setMsgOpacity(0), 2200);
      setTimeout(() => setStep("framework"), 3200);
    }, 3500);
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
      const n = usosHoy + 1;
      setUsosHoy(n);
      saveUsosHoy(n);
      if (getSinglePass()) useSinglePass();
    } catch {
      setApiError("Hubo un error generando tu reflexión. Intenta de nuevo.");
      setStep("framework");
    }
    setTexto("");
  }, [texto, marco, resp1, resp2, usosHoy, crisisDetectedInText]);

  const reiniciar = () => {
    setStep("landing");
    setTexto(""); setMarco(null); setReflexion(""); setCitasUsadas([]);
    setShowCrisis(false); setCrisisAck(false); setShowDisclaimer(false);
    setPreguntaStep(0); setResp1(""); setResp2("");
    setCierreStep(0); setCierreTexto(""); setCierreTexto2(""); setShowCierreInput(false);
    setMsgOpacity(0); setApiError(""); setShowCrisisBanner(false);
    setCrisisDetectedInText(false); crisisShownOnce.current = false;
    setShowFuentes(false);
    setDayPass(getDayPass()); setUsosHoy(getUsosHoy());
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

  // ── MODALS ───────────────────────────────────

  const Overlay = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 bg-[#3A3733]/40 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F3EFEA] max-w-[560px] w-full rounded-md p-8 max-h-[90vh] overflow-y-auto border border-[#D8CFC4]">
        {children}
      </div>
    </div>
  );

  const DisclaimerModal = () => (
    <Overlay>
      <div className={`${S.divider} mb-6`} style={{ width: 40 }} />
      <h2 className="text-xl font-medium text-center mb-6">Aviso importante</h2>
      {[
        ["Esto no es terapia ni consejería profesional", "mepesamucho.com es un espacio de reflexión personal. No sustituye la atención psicológica, psiquiátrica o médica."],
        ["No es consejo médico ni legal", "Las reflexiones son de carácter espiritual y contemplativo. No deben interpretarse como diagnóstico o recomendación profesional."],
        ["Exención de responsabilidad por interpretación", "mepesamucho.com no se hace responsable por las interpretaciones, decisiones o acciones que el usuario tome a partir del contenido."],
        ["Tu privacidad es prioridad", "No almacenamos tu texto. Se procesa en el momento y se elimina. No se construyen perfiles de usuario."],
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
        <button className={S.btn} onClick={() => setShowDisclaimer(false)}>Entendido</button>
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
              <a href={l.url} target="_blank" rel="noopener noreferrer" className={`${S.sub} text-sm text-[#8B6F5E] underline`}>{l.phone}</a>
            ) : (
              <p className="font-[var(--font-sans)] text-lg text-[#8B6F5E] font-medium tracking-wide">{l.phone}</p>
            )}
            {l.note && <p className={`${S.sub} text-xs mt-0.5`} style={{ opacity: 0.6 }}>{l.note}</p>}
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-[#D8CFC4] text-center">
        <p className={`${S.sub} text-sm italic mb-4`}>Si deseas continuar con tu reflexión, puedes hacerlo.</p>
        <button className={S.btn} onClick={() => { setShowCrisis(false); setCrisisAck(true); }}>
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
        <button className={S.btn} onClick={() => setShowFuentes(false)}>Cerrar</button>
      </div>
    </Overlay>
  );

  // ── CRISIS BANNER (persistent, non-intrusive) ─

  const CrisisBanner = () => (
    <div className="fixed top-0 left-0 right-0 z-40 animate-slide-down">
      <div className="bg-[#8B6F5E] text-white px-4 py-3 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="text-lg flex-shrink-0">&#9829;</span>
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
          aria-label="Cerrar"
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
        className="w-11 h-11 rounded-full bg-[#EAE4DC] border border-[#D8CFC4] text-[#3A3733] font-[var(--font-serif)] text-sm cursor-pointer transition-all duration-300 hover:bg-[#C4B6A5] hover:text-white hover:border-[#C4B6A5] shadow-md flex items-center justify-center"
        aria-label="Cambiar tamaño de letra"
      >
        {FONT_SIZES[fontSize].label}
      </button>
    </div>
  );

  // ═══════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════

  // ── LIMIT ────────────────────────────────────

  if (usosHoy >= 2 && !dayPass.active && !getSinglePass() && step === "landing") {
    return (
      <div className={`${S.page} animate-fade-in`} key={fadeKey}>
        {showDisclaimer && <DisclaimerModal />}
        <div className={`${S.box} text-center`}>
          <h1 className="text-xl font-light mb-4">Has usado tus dos reflexiones de hoy.</h1>
          <p className={`${S.sub} text-base mb-8`}>Vuelve mañana, o elige una opción para continuar.</p>

          <div className="border border-[#D8CFC4] rounded-md p-5 mb-3 flex items-center justify-between flex-wrap gap-3">
            <div className="text-left">
              <p className="text-[1.05rem] font-medium">Solo una reflexión más</p>
              <p className={`${S.sub} text-sm`}>$0.50 USD · Acceso inmediato</p>
            </div>
            <button className={S.btnSm} onClick={() => checkout("single")}>Desbloquear</button>
          </div>

          <div className="bg-[#EAE4DC] border border-[#D8CFC4] rounded-md p-6 mb-3 text-center">
            <p className="text-lg font-medium mb-1">Acceso ampliado — 24 horas</p>
            <p className={`${S.sub} text-sm mb-2`}>Reflexiones ilimitadas por 24 horas.</p>
            <p className="text-xl mb-3">$0.99 USD</p>
            <button className={S.btn} onClick={() => checkout("daypass")}>Activar acceso 24h</button>
          </div>

          <div className="border border-[#D8CFC4] rounded-md p-6 mb-6 text-center">
            <p className="text-lg font-medium mb-1">Suscripción mensual</p>
            <p className={`${S.sub} text-sm mb-2`}>Sin límite. Reflexiones personalizadas. Cancela cuando quieras.</p>
            <p className="text-xl mb-3">$4.99 USD / mes</p>
            <button className={S.btn} onClick={() => checkout("subscription")}>Suscribirme</button>
          </div>

          {/* Recovery section */}
          <div className="border border-[#D8CFC4] rounded-md p-5 mb-6 bg-[#F5ECE3]/50">
            <p className={`${S.subStrong} text-sm mb-3`}>¿Ya tienes acceso?</p>
            {!recoveryMode ? (
              <div className="flex gap-2 flex-wrap justify-center">
                <button className={S.btnSm} onClick={() => { setRecoveryMode("email"); setRecoveryInput(""); setRecoveryError(""); }}>
                  Tengo un email registrado
                </button>
                <button className={S.btnSm} onClick={() => { setRecoveryMode("code"); setRecoveryInput(""); setRecoveryError(""); }}>
                  Tengo un código
                </button>
              </div>
            ) : (
              <div>
                <input
                  type={recoveryMode === "email" ? "email" : "text"}
                  value={recoveryInput}
                  onChange={(e) => setRecoveryInput(e.target.value)}
                  placeholder={recoveryMode === "email" ? "Tu email..." : "MPM-XXXX-XXXX"}
                  className="w-full p-3 font-[var(--font-sans)] text-sm bg-transparent border border-[#D8CFC4] rounded outline-none mb-2"
                  autoFocus
                  style={recoveryMode === "code" ? { textTransform: "uppercase", letterSpacing: "0.1em" } : undefined}
                />
                {recoveryError && <p className="text-sm text-[#8B6F5E] mb-2">{recoveryError}</p>}
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
                          setRecoveryError(data.error || "No se encontró acceso.");
                        }
                      } catch {
                        setRecoveryError("Error de conexión. Intenta de nuevo.");
                      }
                      setRecoveryLoading(false);
                    }}
                  >
                    {recoveryLoading ? "Verificando..." : "Verificar"}
                  </button>
                  <button className={`${S.link} text-sm`} onClick={() => setRecoveryMode(null)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-6 flex-wrap">
            <button className={S.link} onClick={() => setShowDisclaimer(true)}>Aviso legal</button>
            <button className={S.link} onClick={() => { setUsosHoy(0); saveUsosHoy(0); }}>(Demo: reiniciar)</button>
          </div>
        </div>
      </div>
    );
  }

  // ── LANDING ──────────────────────────────────

  if (step === "landing") {
    return (
      <div className={`${S.page} animate-fade-in`} key={fadeKey}>
        {showDisclaimer && <DisclaimerModal />}
        <div className={`${S.box} text-center`}>
          <div className="flex justify-center"><LogoIcon size={36} /></div>
          <h1 className="text-4xl font-light tracking-tight mb-1 mt-3">mepesamucho</h1>
          <div className="w-10 h-px bg-[#C4B6A5] mx-auto my-6" />
          <p className="text-lg text-[#6F6A64] italic leading-relaxed mb-3">
            A veces las cosas pesan menos cuando las sueltas.
          </p>
          <p className={`${S.sub} text-sm mb-10`}>
            Escribe lo que cargas. Nadie más lo leerá.
          </p>
          <button className={`${S.btn} text-lg px-8 py-3`} onClick={() => setStep("writing")}>
            Empezar
          </button>

          {dayPass.active ? (
            <p className={`${S.sub} text-xs mt-6`}>Acceso ampliado activo — {dayPass.hoursLeft}h restantes</p>
          ) : (
            <p className={`${S.sub} text-xs mt-6`}>
              {2 - usosHoy} {2 - usosHoy === 1 ? "reflexión disponible" : "reflexiones disponibles"} hoy
            </p>
          )}

          <div className="mt-8">
            <button className={`${S.link} text-xs`} onClick={() => setShowDisclaimer(true)}>
              Aviso legal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── WRITING (centered vertically) ─────────────

  if (step === "writing") {
    return (
      <div className={`${S.page} animate-fade-in`} key={fadeKey}>
        {showCrisis && <CrisisModal />}
        {showCrisisBanner && <CrisisBanner />}
        <div className={`${S.box}`}>
          <p className={`${S.sub} text-sm text-center mb-6`}>Nadie más leerá esto. No se guarda.</p>
          <textarea
            value={texto}
            onChange={handleTextoChange}
            placeholder="Escribe lo que te pesa..."
            autoFocus
            className={S.textareaLg}
          />
          {texto.trim().length > 0 && (
            <div className="text-center mt-6 transition-opacity duration-500" style={{ opacity: texto.trim().length > 5 ? 1 : 0.5 }}>
              <button className={S.btn} onClick={iniciarDisolucion}>Soltar</button>
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
          <div className="animate-dissolve text-lg leading-relaxed p-5 whitespace-pre-wrap break-words max-h-[60vh] overflow-hidden">
            {texto}
          </div>
        </div>
      </div>
    );
  }

  // ── MESSAGE ──────────────────────────────────

  if (step === "message") {
    return (
      <div className={S.page}>
        {showCrisisBanner && <CrisisBanner />}
        {showCrisis && <CrisisModal />}
        <div className={`${S.box} text-center`}>
          <p
            className="text-xl text-[#6F6A64] italic font-light transition-all duration-[900ms]"
            style={{ opacity: msgOpacity, transform: msgOpacity === 0 ? "translateY(8px)" : "translateY(0)" }}
          >
            Ya no lo cargas solo.
          </p>
        </div>
      </div>
    );
  }

  // ── FRAMEWORK ────────────────────────────────

  if (step === "framework") {
    return (
      <div className={`${S.page} animate-fade-in`} key={fadeKey}>
        {showCrisisBanner && <CrisisBanner />}
        {showCrisis && <CrisisModal />}
        <div className={`${S.box} text-center`}>
          <div className={`${S.divider} mb-6`} style={{ opacity: 0.5 }} />
          <p className={`${S.sub} text-sm mb-2`}>Ahora elige cómo quieres escucharte.</p>
          <p className="text-lg text-[#6F6A64] italic mb-8">¿Desde qué tradición?</p>
          {apiError && <p className={`${S.sub} text-sm text-[#8B6F5E] mb-4`}>{apiError}</p>}
          <div className="flex flex-col gap-3">
            {(Object.entries(MARCOS) as [Marco, { nombre: string; descripcion: string }][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setMarco(key); setPreguntaStep(0); setStep("preguntas"); }}
                className="text-left p-4 bg-transparent border border-[#D8CFC4] rounded transition-all duration-300 hover:bg-[#EAE4DC] hover:border-[#C4B6A5] cursor-pointer"
              >
                <span className="block text-lg font-medium">{val.nombre}</span>
                <span className={`block ${S.sub} text-sm mt-1`}>{val.descripcion}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── PREGUNTAS (with crisis detection) ─────────

  if (step === "preguntas") {
    const isQ1 = preguntaStep === 0;
    const val = isQ1 ? resp1 : resp2;
    const handleChange = isQ1 ? handleResp1Change : handleResp2Change;

    // Block advancing if crisis detected and not acknowledged
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

    return (
      <div className={`${S.page} animate-fade-in`} key={`q${fadeKey}`}>
        {showCrisisBanner && <CrisisBanner />}
        {showCrisis && <CrisisModal />}
        <div className={`${S.box} text-center`}>
          <p className={`${S.sub} text-sm mb-3`}>{isQ1 ? "Antes de tu reflexión:" : "Una más:"}</p>
          <h2 className="text-xl font-normal italic leading-snug mb-6">
            {isQ1 ? "¿Qué es lo que más necesitas en este momento?" : "¿Esto que te pesa viene de hace tiempo o es reciente?"}
          </h2>
          <textarea
            value={val}
            onChange={handleChange}
            placeholder="Escribe con tus palabras..."
            autoFocus
            className={S.textarea}
          />
          <div className="mt-5">
            <button
              disabled={!val.trim()}
              onClick={handleContinue}
              className={`${S.btn} ${!val.trim() ? "opacity-40 cursor-default" : ""}`}
            >
              Continuar
            </button>
          </div>
          <p className={`${S.sub} text-[0.75rem] mt-6`}>{isQ1 ? "1 de 2" : "2 de 2"}</p>
        </div>
      </div>
    );
  }

  // ── GENERATING (breathing light animation) ──

  if (step === "generating") {
    return (
      <div className={S.page}>
        {showCrisisBanner && <CrisisBanner />}
        <div className={`${S.box} text-center flex flex-col items-center`}>
          <div className="relative mb-8">
            <div className="w-16 h-16 rounded-full bg-[#C4B6A5]/20 animate-breathe-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#C4B6A5]/30 animate-breathe" />
            </div>
          </div>
          <p className={`${S.sub} italic text-base animate-text-breath`}>
            Preparando tu reflexión...
          </p>
          <p className={`${S.sub} text-xs mt-4`}>
            Esto puede tomar unos segundos
          </p>
        </div>
      </div>
    );
  }

  // ── ESSAY (redesigned — scrollable reflection + visible closing) ────

  if (step === "essay") {
    const cleanMarkdown = (text: string): string => {
      return text.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
    };

    const renderReflexion = () => {
      return reflexion.split("\n\n").map((p, i) => {
        const t = p.trim();
        if (!t) return null;

        const headerMatch = t.match(/^#{1,3}\s+(.+)$/);
        if (headerMatch) {
          return (
            <h2 key={i} className="text-center font-light italic mb-6 mt-2 text-[#6F6A64]" style={{ fontSize: fs.xl }}>
              {cleanMarkdown(headerMatch[1])}
            </h2>
          );
        }

        const cleaned = cleanMarkdown(t);
        const isCita = cleaned.startsWith("<<") || cleaned.startsWith("\u00AB") || cleaned.startsWith('"');
        const isAttrib = cleaned.startsWith("\u2014") || cleaned.startsWith("--");
        const isQ = cleaned.endsWith("?") && cleaned.length < 200;

        if (isCita) return (
          <blockquote
            key={i}
            className="my-8 py-5 px-6 bg-[#EAE4DC]/50 rounded-r-md italic leading-loose"
            style={{ fontSize: fs.cita, borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#C4B6A5" }}
          >
            {cleaned}
          </blockquote>
        );
        if (isAttrib) return <p key={i} className={`${S.sub} text-sm pl-6 mb-6 font-medium`}>{cleaned}</p>;
        if (isQ) return (
          <p key={i} className="my-8 italic text-[#8B6F5E] text-center leading-relaxed" style={{ fontSize: fs.lg }}>
            {cleaned}
          </p>
        );
        return (
          <p key={i} className="mb-5 text-justify leading-loose" style={{ fontSize: fs.base }}>
            {cleaned}
          </p>
        );
      });
    };

    return (
      <div className={`min-h-screen bg-[#F3EFEA] text-[#3A3733] font-[var(--font-serif)] animate-fade-in`} key={fadeKey}>
        {showDisclaimer && <DisclaimerModal />}
        {showCrisis && <CrisisModal />}
        {showCrisisBanner && <CrisisBanner />}
        {showFuentes && <FuentesModal />}
        <FontSizeToggle />

        {/* ── Logo header section ── */}
        <div className="flex flex-col items-center pt-8 pb-3 sm:pt-10 sm:pb-4" style={{ minHeight: "14vh" }}>
          <div className="flex flex-col items-center justify-end flex-1 pb-3">
            <LogoIcon size={28} />
            <p className="text-lg sm:text-xl font-light tracking-tight mt-2 text-[#3A3733]/80">mepesamucho</p>
            <div className="w-10 h-px bg-[#C4B6A5] mt-3 mb-2" />
            <p className="font-[var(--font-sans)] text-xs uppercase tracking-[0.2em] text-[#6F6A64] font-light">
              {MARCOS[marco!]?.nombre}
            </p>
          </div>
        </div>

        {/* ── "Lee despacio" ── */}
        <div className="text-center mb-4 px-5">
          <p className="font-[var(--font-sans)] text-sm sm:text-base italic text-[#8B6F5E] font-light tracking-wide">
            Lee despacio. Esto fue escrito para ti.
          </p>
        </div>

        {/* ── Main content area (centered 800px) ── */}
        <div style={{ maxWidth: "800px", width: "100%", margin: "0 auto", paddingLeft: "1.5rem", paddingRight: "1.5rem", paddingBottom: "3rem" }}>

          {/* ── Reflection body in scrollable card ── */}
          <div
            className="bg-white/40 border border-[#D8CFC4] rounded-lg p-6 sm:p-8"
            style={{ maxHeight: "60vh", overflowY: "auto" }}
          >
            <div className="leading-loose">{renderReflexion()}</div>
          </div>

          {/* ── "Ver fuentes citadas" button ── */}
          <div className="text-center mt-5">
            <button
              className={`${S.link} text-sm`}
              onClick={() => setShowFuentes(true)}
            >
              Ver fuentes citadas ({citasUsadas.length})
            </button>
          </div>

          {/* Closing question flow */}
          <div className="mt-6 py-6 px-5 sm:px-6 text-center border-t border-b border-[#D8CFC4]">

            {cierreStep === 0 && (
              <>
                <p className="text-lg italic leading-relaxed mb-4">{PREGUNTAS_CIERRE[cIdx]}</p>
                {!showCierreInput ? (
                  <button className={S.btnSm} onClick={() => setShowCierreInput(true)}>Quiero responder</button>
                ) : (
                  <div>
                    <textarea value={cierreTexto} onChange={handleCierreTextoChange} placeholder="Escribe lo que quieras..." autoFocus className={`${S.textarea} mb-3`} />
                    {cierreTexto.trim() && <button className={S.btnSm} onClick={() => setCierreStep(1)}>Compartir</button>}
                  </div>
                )}
              </>
            )}

            {cierreStep === 1 && (
              <div className="text-left animate-fade-in">
                <p className="text-sm italic text-[#6F6A64] mb-4 pl-3" style={{ borderLeftWidth: "2px", borderLeftStyle: "solid", borderLeftColor: "#D8CFC4" }}>{cierreTexto}</p>
                <p className="text-[1.05rem] leading-loose mb-5">{PROFUNDIZACIONES[cIdx]}</p>
                <p className="text-lg italic text-center leading-relaxed mb-4">{PREGUNTAS_SEGUNDO[cIdx]}</p>
                <textarea value={cierreTexto2} onChange={handleCierreTexto2Change} placeholder="Escribe lo que quieras..." autoFocus className={`${S.textarea} mb-3`} />
                {cierreTexto2.trim() && (
                  <div className="text-center"><button className={S.btnSm} onClick={() => setCierreStep(2)}>Continuar</button></div>
                )}
              </div>
            )}

            {cierreStep === 2 && (
              <div className="animate-fade-in">
                <p className="text-[1.05rem] leading-loose mb-5">Lo que estás tocando merece más espacio.</p>
                <div className="bg-[#EAE4DC] border border-[#D8CFC4] rounded p-5">
                  <p className="text-[1.05rem] mb-1">Este nivel de conversación es parte de la experiencia completa.</p>
                  <p className={`${S.sub} text-sm mb-4`}>Cada respuesta tuya abre una reflexión más profunda, más tuya.</p>
                  <div className="flex flex-col gap-2 items-center">
                    <button className={S.btn} onClick={() => checkout("subscription")}>Suscribirme — $4.99/mes</button>
                    <button className={`${S.sub} text-sm cursor-pointer bg-transparent border-none hover:text-[#C4B6A5] transition-colors`} onClick={() => checkout("daypass")}>
                      Acceso 24h por $0.99
                    </button>
                    <button className={`${S.sub} text-xs cursor-pointer bg-transparent border-none hover:text-[#C4B6A5] transition-colors`} onClick={() => checkout("single")}>
                      Solo esta reflexión · $0.50
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Return */}
          <div className="text-center mt-8">
            <button onClick={reiniciar} className={`${S.link} underline underline-offset-4 decoration-[#C4B6A5] text-sm`}>
              Volver cuando lo necesite
            </button>
          </div>

          {/* Footer — legible colors, no opacity tricks */}
          <div className="mt-12 text-center">
            <div className={`${S.divider} mb-5`} />
            <p className="font-[var(--font-sans)] text-xs text-[#857F78] leading-relaxed">mepesamucho.com · Un espacio de reflexión, no de consejería.</p>
            <p className="font-[var(--font-sans)] text-xs text-[#857F78] leading-relaxed mt-1">Lo que escribiste ya fue soltado. No quedó registro.</p>
            <button className="font-[var(--font-sans)] text-xs text-[#6F6A64] cursor-pointer underline decoration-[#D8CFC4] underline-offset-4 hover:text-[#C4B6A5] transition-colors bg-transparent border-none mt-3" onClick={() => setShowDisclaimer(true)}>Aviso legal</button>
          </div>
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
              <p className={`${S.sub} text-base mb-8`}>
                ¿Cómo quieres guardar tu acceso?
              </p>

              {accessError && <p className="text-sm text-[#8B6F5E] mb-4">{accessError}</p>}

              {/* Option 1: Email */}
              <div className="border border-[#D8CFC4] rounded-md p-5 mb-4 text-left">
                <p className="text-[1.05rem] font-medium mb-1">Guardar con mi email</p>
                <p className={`${S.sub} text-sm mb-3`}>Más cómodo. Recupera tu acceso desde cualquier dispositivo con solo ingresar tu email.</p>
                <input
                  type="email"
                  value={accessEmail}
                  onChange={(e) => setAccessEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full p-3 font-[var(--font-sans)] text-sm bg-transparent border border-[#D8CFC4] rounded outline-none mb-2"
                />
                <button
                  className={`${S.btnSm} w-full ${accessSaving ? "opacity-50" : ""}`}
                  disabled={!accessEmail.trim() || accessSaving}
                  onClick={handleSaveWithEmail}
                >
                  {accessSaving ? "Guardando..." : "Guardar con email"}
                </button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 my-5">
                <div className="flex-1 h-px bg-[#D8CFC4]" />
                <span className={`${S.sub} text-sm`}>o</span>
                <div className="flex-1 h-px bg-[#D8CFC4]" />
              </div>

              {/* Option 2: Anonymous code */}
              <div className="border border-[#D8CFC4] rounded-md p-5 mb-4 text-left">
                <p className="text-[1.05rem] font-medium mb-1">Guardar con código anónimo</p>
                <p className={`${S.sub} text-sm mb-3`}>Más privado. Se genera un código único que solo tú conocerás. Guárdalo en un lugar seguro.</p>
                <button
                  className={`${S.btnSm} w-full ${accessSaving ? "opacity-50" : ""}`}
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
            /* Code generated */
            <>
              <h2 className="text-xl font-light mb-2">Tu código de acceso</h2>
              <p className={`${S.sub} text-sm mb-6`}>
                Guarda este código en un lugar seguro. Es tu única forma de recuperar tu acceso si cambias de navegador.
              </p>
              <div className="bg-[#EAE4DC] border border-[#D8CFC4] rounded-md p-6 mb-4">
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
            /* Email saved */
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
