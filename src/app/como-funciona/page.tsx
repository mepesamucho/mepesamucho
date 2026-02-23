import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cómo funciona mepesamucho — Reflexión personalizada en 4 pasos",
  description:
    "Escribe lo que te pesa, elige tu tradición, recibe una reflexión personalizada con citas verificadas, y profundiza si quieres. Así funciona mepesamucho.",
  openGraph: {
    title: "Cómo funciona mepesamucho",
    description: "Escribe lo que te pesa. Elige tu tradición. Recibe sabiduría verificada. Profundiza si quieres.",
    url: "https://mepesamucho.com/como-funciona",
  },
  alternates: {
    canonical: "https://mepesamucho.com/como-funciona",
  },
};

const PASOS = [
  {
    num: "1",
    titulo: "Escribe lo que te pesa",
    descripcion:
      "Sin filtros, sin juicios. Un espacio seguro donde tu información es privada y nunca se almacena. Escribe lo que necesites soltar.",
  },
  {
    num: "2",
    titulo: "Elige tu tradición",
    descripcion:
      "Recibe tu reflexión desde la sabiduría bíblica, la filosofía clásica (estoicismo grecorromano) o la espiritualidad universal.",
  },
  {
    num: "3",
    titulo: "Recibe una reflexión personalizada",
    descripcion:
      "Una reflexión escrita especialmente para ti, con citas verificables de fuentes originales. Cada reflexión es única porque nace de lo que escribiste.",
  },
  {
    num: "4",
    titulo: "Profundiza si quieres",
    descripcion:
      "Puedes responder, continuar la conversación o descargar tu reflexión en PDF para llevarla contigo. El espacio se adapta a lo que necesites.",
  },
];

const PREGUNTAS = [
  {
    pregunta: "¿Es terapia?",
    respuesta:
      "No. mepesamucho es un espacio de reflexión, no de consejería profesional. Si necesitas apoyo terapéutico, te recomendamos buscar un profesional de salud mental.",
  },
  {
    pregunta: "¿Se guarda lo que escribo?",
    respuesta:
      "No. Tu texto se procesa en el momento para generar tu reflexión y luego se elimina. No almacenamos ni compartimos nada de lo que escribes.",
  },
  {
    pregunta: "¿Cuánto cuesta?",
    respuesta:
      "Tienes 1 sesión completa gratuita cada 24 horas. Si quieres más, puedes obtener una sesión extra por $19 MXN o acceso ilimitado por $99 MXN al mes.",
  },
  {
    pregunta: "¿Las citas son reales?",
    respuesta:
      "Sí. Cada cita incluye su fuente verificable: libro, capítulo y versículo para textos bíblicos, obra y autor para filosofía clásica, y tradición de origen para espiritualidad universal.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-[640px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-block mb-12 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          &larr; Volver al inicio
        </Link>

        <h1 className="font-[var(--font-heading)] text-3xl font-medium mb-12 leading-snug">
          Cómo funciona mepesamucho
        </h1>

        {/* Pasos */}
        <div className="space-y-10 mb-16">
          {PASOS.map((paso) => (
            <div key={paso.num} className="flex gap-5">
              <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[var(--color-accent)] flex items-center justify-center text-sm text-[var(--color-accent)]">
                {paso.num}
              </div>
              <div>
                <h2 className="font-[var(--font-heading)] text-lg font-medium mb-2">
                  {paso.titulo}
                </h2>
                <p className="text-[var(--color-text-secondary)] leading-relaxed text-[0.95rem]">
                  {paso.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="w-10 h-px bg-[var(--color-accent)] my-12" />

        {/* Preguntas frecuentes */}
        <h2 className="font-[var(--font-heading)] text-2xl font-medium mb-8">
          Preguntas frecuentes
        </h2>
        <div className="space-y-8 mb-16">
          {PREGUNTAS.map((item) => (
            <div key={item.pregunta}>
              <h3 className="font-[var(--font-heading)] text-base font-medium mb-2">
                {item.pregunta}
              </h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-[0.95rem]">
                {item.respuesta}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-block border border-[var(--color-accent)] text-[var(--color-accent)] rounded-full px-6 py-2.5 text-sm hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] transition-colors"
          >
            Quiero soltar lo que cargo
          </Link>
        </div>
      </div>

      {/* FAQ Schema.org for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: PREGUNTAS.map((item) => ({
              "@type": "Question",
              name: item.pregunta,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.respuesta,
              },
            })),
          }),
        }}
      />
    </main>
  );
}
