import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Inter:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-[#F3EFEA] text-[#3A3733]">
        {children}
      </body>
    </html>
  );
}
