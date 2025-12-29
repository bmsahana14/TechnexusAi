import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import TechNexusChatbot from "@/components/TechNexusChatbot";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "TechNexus AI | The Ultimate Real-Time Quiz Arena",
  description: "Transform your presentations into interactive, high-stakes quizzes instantly. Powered by TechNexus Community for 1000+ concurrent players.",
  keywords: ["AI Quiz", "TechNexus", "Real-time Quiz", "Educational AI", "Interactive Presentation", "Socket.IO Quiz", "Next.js Arena", "TechNexus Community"],
  authors: [{ name: "TechNexus Community" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        {children}
        <TechNexusChatbot />
      </body>
    </html>
  );
}

