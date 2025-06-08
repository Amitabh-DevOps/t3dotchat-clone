import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const proximaVara = localFont({
  src: "../assets/fonts/proxima_vara.woff2",
  variable: "--font-proxima-vara",
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
      <body className={`${proximaVara.variable} font-proxima-vara antialiased`}>
        {children}
      </body>
    </html>
  );
}
