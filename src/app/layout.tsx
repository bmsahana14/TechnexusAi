import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

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
  description: "Transform your tech presentations into interactive, high-stakes quizzes instantly using GPT-4o powered AI. Designed for 1000+ concurrent players.",
  keywords: ["AI Quiz", "TechNexus", "Real-time Quiz", "Educational AI", "Interactive Presentation", "Socket.IO Quiz", "Next.js Arena"],
  authors: [{ name: "TechNexus Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
