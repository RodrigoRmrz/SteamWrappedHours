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
  title: "All Steam Time",
  description:
    "Pega tu perfil, SteamID64 o vanity URL y calcula el total acumulado de horas en tu biblioteca publica de Steam.",
  applicationName: "All Steam Time",
  keywords: [
    "Steam",
    "Next.js",
    "playtime",
    "hours tracker",
    "gaming stats",
  ],
  openGraph: {
    title: "All Steam Time",
    description:
      "Calcula las horas totales acumuladas en tu biblioteca publica de Steam, incluyendo demos y betas cuando Steam las expone.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "All Steam Time",
    description:
      "Tu biblioteca publica de Steam en una sola cifra clara y un top de playtime.",
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
