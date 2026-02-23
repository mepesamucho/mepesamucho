import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Acerca de mepesamucho — Espacio de reflexión personal",
  description:
    "mepesamucho.com es un espacio digital de reflexión personal. Un puente entre lo que sientes y la sabiduría de tradiciones que han acompañado al ser humano durante siglos.",
  openGraph: {
    title: "Acerca de mepesamucho",
    description: "Un espacio digital de reflexión personal. No somos terapeutas. Somos un puente entre lo que sientes y la sabiduría ancestral.",
    url: "https://mepesamucho.com/acerca-de",
  },
  alternates: {
    canonical: "https://mepesamucho.com/acerca-de",
  },
};

export default function AcercaDePage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-[640px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-block mb-12 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          &larr; Volver al inicio
        </Link>

        <h1 className="font-[var(--font-heading)] text-3xl font-medium mb-8 leading-snug">
          Acerca de mepesamucho
        </h1>

        <div className="space-y-6 text-[var(--color-text-secondary)] leading-relaxed">
          <p>
            mepesamucho.com es un espacio digital de reflexión personal. Nació de la
            creencia de que a veces solo necesitamos soltar lo que cargamos y recibir una
            palabra que nos ayude a verlo desde otro lugar.
          </p>

          <p>
            No somos terapeutas ni consejeros. Somos un puente entre lo que sientes y la
            sabiduría de tradiciones que han acompañado al ser humano durante siglos:
            filosofía clásica, espiritualidad universal, textos bíblicos.
          </p>

          <p>
            Cada reflexión que recibes es única, generada a partir de lo que escribes y del
            marco que eliges. Las citas son reales y verificadas. Tu texto no se almacena
            ni se comparte.
          </p>

          <div className="w-10 h-px bg-[var(--color-accent)] my-8" />

          <p className="text-sm text-[var(--color-text-tertiary)] italic">
            Un proyecto independiente de bienestar emocional.
          </p>

          <div className="pt-8">
            <Link
              href="/"
              className="inline-block border border-[var(--color-accent)] text-[var(--color-accent)] rounded-full px-6 py-2.5 text-sm hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)] transition-colors"
            >
              Quiero soltar lo que cargo
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
