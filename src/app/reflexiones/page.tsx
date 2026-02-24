import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Reflexiones — mepesamucho",
  description:
    "Artículos sobre bienestar emocional, journaling, filosofía estoica y el arte de soltar lo que no puedes controlar. Reflexiones para llevar paz a tu día.",
  openGraph: {
    title: "Reflexiones — mepesamucho",
    description:
      "Artículos sobre bienestar emocional, journaling, filosofía estoica y el arte de soltar. Sabiduría para tu viaje interior.",
    url: "https://mepesamucho.com/reflexiones",
  },
  alternates: {
    canonical: "https://mepesamucho.com/reflexiones",
  },
};

const ARTICULOS = [
  {
    slug: "que-hacer-cuando-todo-te-pesa",
    titulo: "¿Qué hacer cuando todo te pesa? 5 formas de soltar la carga emocional",
    descripcion:
      "Aprende cinco estrategias concretas para aliviar el peso emocional y encontrar claridad cuando la carga se siente insoportable.",
    fecha: "23 de febrero, 2026",
  },
  {
    slug: "el-poder-de-escribir-lo-que-sientes",
    titulo: "El poder de escribir lo que sientes — Por qué el journaling cambia tu vida",
    descripcion:
      "Descubre cómo la escritura terapéutica puede transformar tus emociones, sanar heridas y conectarte con tu sabiduría interior.",
    fecha: "23 de febrero, 2026",
  },
  {
    slug: "frases-estoicas-para-momentos-dificiles",
    titulo: "10 frases estoicas para momentos difíciles — Sabiduría que transforma",
    descripcion:
      "Encuentra sabiduría atemporal de Séneca y Marco Aurelio para enfrentar los desafíos con serenidad y propósito.",
    fecha: "23 de febrero, 2026",
  },
  {
    slug: "como-encontrar-paz-interior",
    titulo: "Cómo encontrar paz interior — Una guía de reflexión contemplativa",
    descripcion:
      "Explora prácticas de meditación y reflexión contemplativa para cultivar la paz que busca tu corazón.",
    fecha: "23 de febrero, 2026",
  },
  {
    slug: "por-que-soltar-no-es-rendirse",
    titulo: "Por qué soltar no es rendirse — El arte de dejar ir lo que no puedes controlar",
    descripcion:
      "Entiende la diferencia profunda entre rendición y aceptación, y por qué dejar ir es el acto más valiente.",
    fecha: "23 de febrero, 2026",
  },
];

export default function ReflexionesPage() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <div className="max-w-[640px] mx-auto px-6 py-20">
        <Link
          href="/"
          className="inline-block mb-12 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
        >
          &larr; Volver al inicio
        </Link>

        <h1 className="font-[var(--font-heading)] text-3xl font-medium mb-4 leading-snug">
          Reflexiones
        </h1>
        <p className="text-[var(--color-text-secondary)] mb-12 leading-relaxed text-[0.95rem]">
          Artículos sobre bienestar emocional, filosofía, journaling y el arte de
          soltar. Cada reflexión es una invitación a profundizar en lo que llevas adentro.
        </p>

        {/* Lista de artículos */}
        <div className="space-y-8 mb-16">
          {ARTICULOS.map((articulo) => (
            <article
              key={articulo.slug}
              className="border-b border-[var(--color-accent)] pb-8 last:border-b-0"
            >
              <Link
                href={`/reflexiones/${articulo.slug}`}
                className="group"
              >
                <h2 className="font-[var(--font-heading)] text-lg font-medium mb-2 leading-snug group-hover:text-[var(--color-accent)] transition-colors">
                  {articulo.titulo}
                </h2>
              </Link>
              <p className="text-[var(--color-text-secondary)] text-sm mb-3">
                {articulo.fecha}
              </p>
              <p className="text-[var(--color-text-secondary)] leading-relaxed text-[0.95rem] mb-4">
                {articulo.descripcion}
              </p>
              <Link
                href={`/reflexiones/${articulo.slug}`}
                className="inline-block text-sm text-[var(--color-accent)] hover:text-[var(--color-accent)] font-medium transition-colors"
              >
                Leer más →
              </Link>
            </article>
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

      {/* Blog Schema.org for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Reflexiones — mepesamucho",
            description:
              "Artículos sobre bienestar emocional, journaling, filosofía estoica y el arte de soltar lo que no puedes controlar.",
            url: "https://mepesamucho.com/reflexiones",
            blogPosts: ARTICULOS.map((articulo) => ({
              "@type": "BlogPosting",
              headline: articulo.titulo,
              description: articulo.descripcion,
              datePublished: "2026-02-23",
              url: `https://mepesamucho.com/reflexiones/${articulo.slug}`,
            })),
          }),
        }}
      />
    </main>
  );
}
