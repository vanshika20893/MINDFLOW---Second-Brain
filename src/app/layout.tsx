import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINDFLOW // AI Synapse Canvas & Second Brain",
  description: "High-speed thought capture, spatial canvas, and auto-structured intelligence.",
  icons: {
    icon: "/emblem.png",
    apple: "/emblem.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0d0e11] text-zinc-100 antialiased selection:bg-[#f26419]/30 selection:text-[#f5c7a9]">
        {children}
      </body>
    </html>
  );
}
