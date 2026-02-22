import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "mepesamucho — Suelta lo que cargas",
  description:
    "Un espacio intimo de reflexion contemplativa. Escribe lo que te pesa, sueltalo, y recibe sabiduria desde tradiciones espirituales y filosoficas verificadas.",
  keywords: ["reflexion", "bienestar emocional", "espiritualidad", "meditacion", "journaling", "desahogo"],
  openGraph: {
    title: "mepesamucho",
    description: "A veces las cosas pesan menos cuando las sueltas.",
    type: "website",
    locale: "es_MX",
    url: "https://mepesamucho.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "mepesamucho",
    description: "A veces las cosas pesan menos cuando las sueltas.",
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
        {/* Prevent dark mode flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('mpm_theme');if(t==='dark'||(t==null&&window.matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
