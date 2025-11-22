/**
 * Purpose: Root layout with MiniKit provider for World App integration
 * Wraps the entire app with MiniKitProvider to enable World ID verification
 * and Mini App functionality throughout the application
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marriage DAO - Get Married On Chain",
  description: "Smart Agreement DAO - Create your on-chain marriage proof with World ID verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* MiniKitProvider enables World App functionality */}
      <MiniKitProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </MiniKitProvider>
    </html>
  );
}
