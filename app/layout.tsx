import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const fraunces = localFont({
  src: "./fonts/Fraunces.ttf",
  variable: "--font-fraunces",
  display: "swap",
  weight: "100 900",
});

const hanken = localFont({
  src: "./fonts/HankenGrotesk.ttf",
  variable: "--font-hanken",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "UVBrain",
  description: "Learn any subject with an AI tutor that adapts to you.",
  icons: { icon: "/brand/uvbrain-favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0e0a1c",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
