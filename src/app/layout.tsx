import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import QueryProvider from "@/components/providers/query-provider";

const proximaVara = localFont({
  src: "../assets/fonts/proxima_vara.woff2",
  variable: "--font-proxima-vara",
  display: "swap",
});

const berkeleyMono = localFont({
  src: "../assets/fonts/berkeley_mono.woff2",
  variable: "--font-berkeley-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "T3.Chat Super Clone",
  description: "T3.Chat Super Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${proximaVara.variable} ${berkeleyMono.variable} selection:text-white selection:bg-primary font-proxima-vara antialiased min-h-screen`}
      >
        <ThemeProvider attribute="class"><QueryProvider> {children}</QueryProvider></ThemeProvider>
      </body>
    </html>
  );
}
