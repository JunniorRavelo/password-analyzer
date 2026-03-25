import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const siteUrl =
  typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
  process.env.NEXT_PUBLIC_SITE_URL.length > 0
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : undefined;

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: "PassGuard · Analizador y generador de contraseñas",
  description:
    "Evalúa la fortaleza de tus contraseñas y genera contraseñas aleatorias seguras en el navegador. Sin enviar datos al servidor.",
  keywords: [
    "contraseña",
    "seguridad",
    "generador",
    "fortaleza",
    "Next.js",
    "passguard",
  ],
  authors: [{ name: "PassGuard" }],
  openGraph: {
    title: "PassGuard · Analizador y generador de contraseñas",
    description:
      "Herramienta en el navegador para generar contraseñas seguras y validar su fortaleza.",
    locale: "es",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "PassGuard · Analizador y generador de contraseñas",
    description:
      "Genera contraseñas aleatorias y analiza su fortaleza sin enviar datos al servidor.",
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12161c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
