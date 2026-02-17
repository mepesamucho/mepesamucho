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
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
          className="underline decoration-[#D8CFC4] underline-offset-2 hover:text-[#C4B6A5] transition-colors bg-transparent border-none cursor-pointer text-xs text-[#6F6A64] font-[var(--font-sans)]"
        >
          Política de privacidad
        </button>
      )}
    </span>
  </div>
);

// ── FONT SIZE BUTTON ──────────────────────────

const FONT_SIZES = [
  { label: "A", base: "1.1rem", lg: "1.2rem", xl: "1.3rem", cita: "1.25rem" },
  { label: "A+", base: "1.25rem", lg: "1.35rem", xl: "1.45rem", cita: "1.4rem" },
  { label: "A++", base: "1.4rem", lg: "1.5rem", xl: "1.6rem", cita: "1.55rem" },
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
  btn: "font-[var(--font-serif)] text-base px-8 py-3.5 bg-[#C4B6A5] text-white border border-[#C4B6A5] rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#B0A292] hover:border-[#B0A292] btn-primary-glow",
  btnSecondary: "font-[var(--font-serif)] text-base px-7 py-3 bg-[#EAE4DC] text-[#3A3733] border border-[#D8CFC4] rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#C4B6A5] hover:text-white hover:border-[#C4B6A5]",
  btnSm: "font-[var(--font-serif)] text-sm px-5 py-2.5 bg-[#EAE4DC] text-[#3A3733] border border-[#D8CFC4] rounded-lg cursor-pointer transition-all duration-300 hover:bg-[#C4B6A5] hover:text-white hover:border-[#C4B6A5]",
  sub: "font-[var(--font-sans)] text-[#6F6A64] font-light leading-relaxed",
  subStrong: "font-[var(--font-sans)] text-[#5C5751] font-light leading-relaxed",
  link: "font-[var(--font-sans)] text-[#6F6A64] font-light text-xs cursor-pointer underline decoration-[#D8CFC4] underline-offset-4 hover:text-[#C4B6A5] transition-colors bg-transparent border-none",
  textarea: "w-full min-h-[120px] p-4 font-[var(--font-serif)] text-[1.1rem] leading-relaxed bg-transparent border border-[#D8CFC4] rounded-lg resize-y outline-none text-left",
  textareaLg: "w-full min-h-[240px] p-5 font-[var(--font-serif)] text-lg leading-relaxed bg-transparent border border-[#D8CFC4] rounded-lg resize-y outline-none",
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
    setShowFuentes(false); setShowAbout(false);
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

  // ── HEADER COMPONENT ─────────────────────────

  const SiteHeader = () => (
    <div className="fixed top-0 left-0 right-0 z-30 bg-[#F3EFEA]/90 backdrop-blur-sm" style={{ borderBottom: "1px solid rgba(216,207,196,0.5)" }}>
      <div className="max-w-[800px] mx-auto px-5 py-3 flex items-center justify-between">
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
        className="w-11 h-11 rounded-full bg-[#EAE4DC] border border-[#D8CFC4] text-[#3A3733] font-[var(--font-serif)] text-sm cursor-pointer transition-all duration-300 hover:bg-[#C4B6A5] hover:text-white hover:border-[#C4B6A5] shadow-md flex items-center justify-center"
        aria-label="Cambiar tamaño de letra"
      >
        {FONT_SIZES[fontSize].label}
      </button>
    </div>
  );

  // ── FOOTER COMPONENT ─────────────────────────

  const Footer = ({ showDemo = false }: { showDemo?: boolean }) => (
    <footer className="mt-10 text-center" role="contentinfo">
      <div className={`${S.divider} mb-5`} />
      <p className="font-[var(--font-sans)] text-xs text-[#857F78] leading-relaxed">mepesamucho.com · Un espacio de reflexión, no de consejería.</p>
      <p className="font-[var(--font-sans)] text-xs text-[#857F78] leading-relaxed mt-1">Lo que escribes no se almacena ni se comparte.</p>
      <div className="flex justify-center gap-4 mt-3 flex-wrap">
        <button className={`${S.link} text-[0.7rem]`} onClick={() => setShowAbout(true)}>Acerca de</button>
        <button className={`${S.link} text-[0.7rem]`} onClick={() => setShowDisclaimer(true)}>Aviso legal y privacidad</button>
        {showDemo && (
          <button className={`${S.link} text-[0.7rem]`} onClick={() => { setUsosHoy(0); saveUsosHoy(0); }}>(Demo: reiniciar)</button>
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
          <h1 className="text-xl font-light mb-3">Has usado tus dos reflexiones gratuitas de hoy.</h1>
          <p className={`${S.sub} text-base mb-6`}>Vuelve mañana, o elige una opción para seguir reflexionando.</p>

          {/* Recovery section — PROMINENT, above pricing */}
          <div className="border-2 border-[#C4B6A5] rounded-lg p-5 mb-6 bg-[#F5ECE3]/60">
            <p className="text-base font-medium mb-1">¿Ya pagaste antes?</p>
            <p className={`${S.sub} text-sm mb-3`}>Recupera tu acceso con el email o código que registraste.</p>
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
                {recoveryError && <p className="text-sm text-[#8B6F5E] mb-2" role="alert">{recoveryError}</p>}
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

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#D8CFC4]" />
            <span className={`${S.sub} text-sm`}>o elige un plan</span>
            <div className="flex-1 h-px bg-[#D8CFC4]" />
          </div>

          {/* Subscription — featured */}
          <div className="bg-[#EAE4DC] border-2 border-[#C4B6A5] rounded-lg p-6 mb-3 text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C4B6A5] text-white text-xs font-[var(--font-sans)] px-3 py-0.5 rounded-full">
              Recomendado
            </div>
            <p className="text-lg font-medium mb-2 mt-1">Suscripción mensual</p>
            <p className="text-2xl font-light mb-2">$4.99 <span className={`${S.sub} text-sm`}>USD / mes</span></p>
            <div className={`${S.sub} text-sm text-left mb-4 space-y-1`}>
              <p>&#10003; Reflexiones ilimitadas, 24/7</p>
              <p>&#10003; Conversaciones guiadas de profundización</p>
              <p>&#10003; Acceso desde cualquier dispositivo</p>
              <p>&#10003; Cancela cuando quieras, sin compromiso</p>
            </div>
            <button className={`${S.btn} w-full text-lg`} onClick={() => checkout("subscription")}>Suscribirme por $4.99/mes</button>
          </div>

          {/* Day pass */}
          <div className="border border-[#D8CFC4] rounded-lg p-5 mb-3 flex items-center justify-between flex-wrap gap-3">
            <div className="text-left">
              <p className="text-base font-medium">Acceso 24 horas</p>
              <p className={`${S.sub} text-sm`}>Reflexiones ilimitadas por un día completo</p>
            </div>
            <div className="text-right flex items-center gap-3">
              <span className="text-lg font-light">$0.99</span>
              <button className={S.btnSm} onClick={() => checkout("daypass")}>Activar</button>
            </div>
          </div>

          {/* Single */}
          <div className="border border-[#D8CFC4] rounded-lg p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="text-left">
              <p className="text-base font-medium">Una reflexión más</p>
              <p className={`${S.sub} text-sm`}>Acceso inmediato a una sola reflexión</p>
            </div>
            <div className="text-right flex items-center gap-3">
              <span className="text-lg font-light">$0.50</span>
              <button className={S.btnSm} onClick={() => checkout("single")}>Desbloquear</button>
            </div>
          </div>

          <p className={`${S.sub} text-xs mb-4`}>Todos los precios en USD. El cobro se procesa de forma segura a través de Stripe.</p>

          <Footer showDemo />
        </div>
      </div>
    );
  }

  // ── LANDING ──────────────────────────────────

  if (step === "landing") {
    return (
      <div className={`${S.page} animate-fade-in`} key={fadeKey}>
        {showDisclaimer && <DisclaimerModal />}
        {showAbout && <AboutModal />}
        <div className={`${S.box} text-center`}>
          <div className="flex justify-center"><LogoIcon size={40} /></div>
          <h1 className="text-4xl font-light tracking-tight mb-1 mt-3">mepesamucho</h1>
          <div className="w-10 h-px bg-[#C4B6A5] mx-auto my-5" />
          <p className="text-lg text-[#5C5751] italic leading-relaxed mb-3">
            A veces las cosas pesan menos cuando las sueltas.
          </p>
          <p className={`${S.subStrong} text-sm leading-relaxed mb-6`}>
            Un espacio seguro para escribir lo que te pesa y recibir una reflexión personalizada basada en sabiduría ancestral.
          </p>

          {/* Benefit bullets */}
          <div className="text-left max-w-[440px] mx-auto mb-8 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-[#C4B6A5] mt-0.5 flex-shrink-0" aria-hidden="true">&#9675;</span>
              <p className={`${S.sub} text-sm`}>Escribe y libera lo que te preocupa, sin que nadie lo lea</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#C4B6A5] mt-0.5 flex-shrink-0" aria-hidden="true">&#9675;</span>
              <p className={`${S.sub} text-sm`}>Recibe reflexiones desde tradiciones como la filosofía, espiritualidad o textos bíblicos</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-[#C4B6A5] mt-0.5 flex-shrink-0" aria-hidden="true">&#9675;</span>
              <p className={`${S.sub} text-sm`}>Profundiza en tus aprendizajes con conversaciones guiadas</p>
            </div>
          </div>

          <button className={`${S.btn} text-lg px-10 py-4`} onClick={() => setStep("writing")} aria-label="Comenzar a escribir">
            Quiero soltar lo que cargo
          </button>

          {dayPass.active ? (
            <p className={`${S.sub} text-xs mt-6`}>Acceso ampliado activo — {dayPass.hoursLeft}h restantes</p>
          ) : (
            <p className={`${S.sub} text-xs mt-6`}>
              {2 - usosHoy} {2 - usosHoy === 1 ? "reflexión gratuita disponible" : "reflexiones gratuitas disponibles"} hoy
            </p>
          )}

          <Footer />
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
          <label htmlFor="texto-principal" className="sr-only">Escribe lo que te pesa</label>
          <textarea
            id="texto-principal"
            value={texto}
            onChange={handleTextoChange}
            placeholder="Escribe aquí lo que necesitas soltar..."
            autoFocus
            className={S.textareaLg}
            aria-label="Espacio para escribir lo que te pesa"
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
          {apiError && <p className={`${S.sub} text-sm text-[#8B6F5E] mb-4`} role="alert">{apiError}</p>}
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="Selecciona un marco de reflexión">
            {(Object.entries(MARCOS) as [Marco, { nombre: string; descripcion: string }][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => { setMarco(key); setPreguntaStep(0); setStep("preguntas"); }}
                className="text-left p-5 bg-transparent border-2 border-[#D8CFC4] rounded-lg transition-all duration-300 hover:bg-[#EAE4DC] hover:border-[#C4B6A5] cursor-pointer group"
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

    // Contextual guides
    const guideQ1 = {
      why: "Esto nos ayuda a centrar tu reflexión en lo que más importa ahora mismo.",
      example: "Por ejemplo: \"Necesito paz\" o \"Quiero entender por qué me siento así\"",
    };
    const guideQ2 = {
      why: "Saber si es algo reciente o de tiempo atrás nos ayuda a encontrar las palabras correctas para ti.",
      example: "Por ejemplo: \"Viene de hace mucho, pero hoy regresó\" o \"Pasó ayer\"",
    };
    const guide = isQ1 ? guideQ1 : guideQ2;

    return (
      <div className={`${S.page} animate-fade-in pt-16`} key={`q${fadeKey}`}>
        <SiteHeader />
        {showCrisisBanner && <CrisisBanner />}
        {showCrisis && <CrisisModal />}
        {showDisclaimer && <DisclaimerModal />}
        {showAbout && <AboutModal />}
        <div className={`${S.box} text-center`}>
          <p className={`${S.sub} text-sm mb-3`}>{isQ1 ? "Antes de tu reflexión:" : "Una pregunta más:"}</p>
          <h2 className="text-xl font-normal italic leading-snug mb-4">
            {isQ1 ? "¿Qué es lo que más necesitas en este momento?" : "¿Esto que te pesa viene de hace tiempo o es reciente?"}
          </h2>

          {/* Contextual guide */}
          <div className="bg-[#F5ECE3]/60 rounded-lg p-4 mb-5 text-left">
            <p className={`${S.sub} text-sm`}>{guide.why}</p>
            <p className={`${S.sub} text-xs italic mt-1`}>{guide.example}</p>
          </div>

          <label htmlFor={`pregunta-${isQ1 ? "1" : "2"}`} className="sr-only">
            {isQ1 ? "Qué necesitas en este momento" : "Desde cuándo te pesa esto"}
          </label>
          <textarea
            id={`pregunta-${isQ1 ? "1" : "2"}`}
            value={val}
            onChange={handleChange}
            placeholder="Escribe con tus palabras..."
            autoFocus
            className={S.textarea}
            aria-label={isQ1 ? "Tu respuesta sobre lo que necesitas" : "Tu respuesta sobre la duración"}
          />
          <div className="mt-5">
            <button
              disabled={!val.trim()}
              onClick={handleContinue}
              className={`${S.btn} ${!val.trim() ? "opacity-40 cursor-default" : ""}`}
              aria-label={isQ1 ? "Continuar a la siguiente pregunta" : "Generar mi reflexión"}
            >
              {isQ1 ? "Continuar" : "Generar mi reflexión"}
            </button>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className={`w-2 h-2 rounded-full ${isQ1 ? "bg-[#C4B6A5]" : "bg-[#D8CFC4]"}`} />
            <div className={`w-2 h-2 rounded-full ${!isQ1 ? "bg-[#C4B6A5]" : "bg-[#D8CFC4]"}`} />
          </div>
          <p className={`${S.sub} text-[0.75rem] mt-2`}>{isQ1 ? "Pregunta 1 de 2" : "Pregunta 2 de 2"}</p>
          <div className="mt-4">
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
            <div className="w-16 h-16 rounded-full bg-[#C4B6A5]/20 animate-breathe-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#C4B6A5]/30 animate-breathe" />
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

  // ── ESSAY (scrollable reflection + visible closing) ────

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
        {showAbout && <AboutModal />}
        {showCrisis && <CrisisModal />}
        {showCrisisBanner && <CrisisBanner />}
        {showFuentes && <FuentesModal />}
        <FontSizeToggle />

        {/* ── Logo header section ── */}
        <div className="flex flex-col items-center pt-8 pb-3 sm:pt-10 sm:pb-4" style={{ minHeight: "14vh" }}>
          <div className="flex flex-col items-center justify-end flex-1 pb-3">
            <button onClick={reiniciar} className="flex flex-col items-center bg-transparent border-none cursor-pointer" aria-label="Volver al inicio">
              <LogoIcon size={28} />
              <p className="text-lg sm:text-xl font-light tracking-tight mt-2 text-[#3A3733]/80">mepesamucho</p>
            </button>
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

          {/* ── Reflection body in scrollable card with scroll hint ── */}
          <div className={`relative ${showScrollHint ? "scroll-hint-bottom" : ""}`}>
            <div
              ref={scrollCardRef}
              className="bg-white/40 border border-[#D8CFC4] rounded-lg p-6 sm:p-8"
              style={{ maxHeight: "60vh", overflowY: "auto" }}
              role="article"
              aria-label="Tu reflexión personalizada"
            >
              <div className="leading-loose">{renderReflexion()}</div>
            </div>
          </div>

          {/* ── "Ver fuentes citadas" button ── */}
          <div className="text-center mt-5">
            <button
              className={`${S.link} text-sm`}
              onClick={() => setShowFuentes(true)}
              aria-label={`Ver ${citasUsadas.length} fuentes citadas`}
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
                    <label htmlFor="cierre-resp" className="sr-only">Tu respuesta</label>
                    <textarea id="cierre-resp" value={cierreTexto} onChange={handleCierreTextoChange} placeholder="Escribe lo que quieras..." autoFocus className={`${S.textarea} mb-3`} />
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
                <label htmlFor="cierre-resp2" className="sr-only">Tu respuesta a la segunda pregunta</label>
                <textarea id="cierre-resp2" value={cierreTexto2} onChange={handleCierreTexto2Change} placeholder="Escribe lo que quieras..." autoFocus className={`${S.textarea} mb-3`} />
                {cierreTexto2.trim() && (
                  <div className="text-center"><button className={S.btnSm} onClick={() => setCierreStep(2)}>Continuar</button></div>
                )}
              </div>
            )}

            {cierreStep === 2 && (
              <div className="animate-fade-in">
                <p className="text-[1.05rem] leading-loose mb-5">Lo que estás tocando merece más espacio.</p>
                <div className="bg-[#EAE4DC] border border-[#D8CFC4] rounded-lg p-5">
                  <p className="text-[1.05rem] mb-1">Este nivel de conversación es parte de la experiencia completa.</p>
                  <p className={`${S.sub} text-sm mb-4`}>Cada respuesta tuya abre una reflexión más profunda, más tuya.</p>
                  <div className="flex flex-col gap-2 items-center">
                    <button className={`${S.btn} w-full`} onClick={() => checkout("subscription")}>Suscribirme — $4.99/mes</button>
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

          {/* Footer */}
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

              {accessError && <p className="text-sm text-[#8B6F5E] mb-4" role="alert">{accessError}</p>}

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
