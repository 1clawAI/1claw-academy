import type { Metadata } from "next";
import { Geist, Geist_Mono, Bakbak_One } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { Nav } from "@/components/Nav";
import { CommandPalette } from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bakbak = Bakbak_One({
  variable: "--font-bakbak",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "1Claw Academy: A course on AI security",
  description:
    "An interactive course on securing AI agents: cryptography and access-control foundations, the agent threat model (prompt injection, the lethal trifecta, OWASP ASI01-10), then hands-on defences built with 1Claw.",
  metadataBase: new URL("https://academy.1claw.co"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bakbak.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ProgressProvider>
          <Nav />
          <CommandPalette />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--border)] px-5 py-8 text-center text-xs text-[var(--muted)]">
            <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              {[
                ["1claw.co", "https://1claw.co"],
                ["Docs", "https://docs.1claw.co"],
                ["For AI", "https://1claw.co/for-ai"],
                ["Brand kit", "https://1claw.co/brand-kit"],
                ["llms.txt", "https://1claw.co/llms.txt"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="transition hover:text-[var(--foreground)]"
                >
                  {label}
                </a>
              ))}
            </nav>
            <p className="mt-4">
              1Claw Academy · An unofficial interactive course · 1Claw is
              HSM-backed secret management for AI agents.
            </p>
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
