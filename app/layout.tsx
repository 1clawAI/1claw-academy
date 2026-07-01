import type { Metadata } from "next";
import { Geist, Geist_Mono, Bakbak_One } from "next/font/google";
import "./globals.css";
import { ProgressProvider } from "@/lib/progress";
import { Nav } from "@/components/Nav";

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
  title: "1Claw Academy: Learn HSM-backed secrets for AI agents",
  description:
    "An interactive, beginner-to-advanced course on 1Claw: vaults, agents, access control, HSM encryption, Shroud TEE, on-chain signing, and more.",
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
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[var(--border)] px-5 py-8 text-center text-xs text-[var(--muted)]">
            1Claw Academy · An unofficial interactive course ·{" "}
            <a
              href="https://1claw.xyz"
              className="underline hover:text-[var(--foreground)]"
            >
              1claw.xyz
            </a>{" "}
            ·{" "}
            <a
              href="https://docs.1claw.xyz"
              className="underline hover:text-[var(--foreground)]"
            >
              docs
            </a>
          </footer>
        </ProgressProvider>
      </body>
    </html>
  );
}
