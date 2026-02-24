import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

const GA_ID = "G-7X2EXDDC4X";

export const metadata: Metadata = {
  title: "mepesamucho — Suelta lo que cargas",
  description:
    "Un espacio íntimo de reflexión contemplativa. Escribe lo que te pesa, suéltalo, y recibe sabiduría desde tradiciones espirituales y filosóficas verificadas.",
  keywords: [
    "reflexión personal", "bienestar emocional", "espiritualidad", "meditación",
    "journaling", "desahogo", "estoicismo", "frases para reflexionar",
    "salud mental", "reflexión contemplativa", "soltar lo que te pesa",
  ],
  metadataBase: new URL("https://mepesamucho.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "mepesamucho — Suelta lo que cargas",
    description: "A veces las cosas pesan menos cuando las sueltas. Un espacio de reflexión personal con sabiduría verificada.",
    type: "website",
    locale: "es_MX",
    url: "https://mepesamucho.com",
    siteName: "mepesamucho",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "mepesamucho — A veces las cosas pesan menos cuando las sueltas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mepesamucho — Suelta lo que cargas",
    description: "A veces las cosas pesan menos cuando las sueltas.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "h_7mMxWhN520OAIN9DFn5N2SBaoKwJAkc4wCzWcqI50",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* FASE 2: Fraunces (headings) + Inter (body) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#162424" />
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "mepesamucho",
              url: "https://mepesamucho.com",
              description: "Espacio de reflexión personal. Escribe lo que te pesa y recibe sabiduría desde tradiciones filosóficas y espirituales verificadas.",
              applicationCategory: "HealthApplication",
              operatingSystem: "Web",
              offers: [
                {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "MXN",
                  description: "1 sesión gratuita cada 24 horas",
                },
                {
                  "@type": "Offer",
                  price: "99",
                  priceCurrency: "MXN",
                  description: "Suscripción mensual — sesiones ilimitadas",
                },
              ],
              inLanguage: "es",
            }),
          }}
        />
        {/* Prevent dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mpm_theme');if(t==='dark'||(t==null&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
