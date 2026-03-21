import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Steam Wrapped Hours",
  description:
    "Descubre el tiempo total invertido en tu biblioteca de Steam con una landing moderna creada con Next.js.",
  applicationName: "Steam Wrapped Hours",
  keywords: [
    "Steam",
    "Next.js",
    "playtime",
    "hours tracker",
    "gaming stats",
  ],
  openGraph: {
    title: "Steam Wrapped Hours",
    description:
      "Pega tu perfil de Steam y calcula las horas totales acumuladas en toda tu biblioteca.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steam Wrapped Hours",
    description:
      "Tu Steam en una sola cifra: horas totales, top juegos y estadisticas de tu biblioteca.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--color-page)] text-[var(--color-foreground)]">
        {children}
      </body>
    </html>
  );
}
