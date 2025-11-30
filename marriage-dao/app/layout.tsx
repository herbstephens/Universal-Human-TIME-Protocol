/**
 * Purpose: Root layout with providers for World App and blockchain integration
 * Wraps the entire app with:
 * - MiniKitProvider: Enables World ID verification and wallet auth
 * - WagmiProvider: Enables Worldchain blockchain integration
 * - QueryClientProvider: Required by wagmi for data fetching
 */

'use client'

import { Geist, Geist_Mono } from "next/font/google";
import { MiniKitProvider } from "@worldcoin/minikit-js/minikit-provider";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi/config";

import "./globals.css";
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Root Layout Component
 * 
 * Provider hierarchy:
 * 1. MiniKitProvider - World App integration (outermost)
 * 2. WagmiProvider - Blockchain connection
 * 3. QueryClientProvider - Data fetching for wagmi
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Create QueryClient instance (must be in client component)
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      {/* MiniKitProvider enables World App functionality */}
      <MiniKitProvider>
        {/* WagmiProvider enables blockchain interactions */}
        <WagmiProvider config={wagmiConfig}>
          {/* QueryClientProvider required by wagmi */}
          <QueryClientProvider client={queryClient}>
            <body
              className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >

              {children}
            </body>
          </QueryClientProvider>
        </WagmiProvider>
      </MiniKitProvider>
    </html>
  );
}
