/**
 * Purpose: Reusable Header component for Marriage DAO
 * Displays the logo in the top-left corner
 * Shows wallet connection button and address in the top-right
 * 
 * Uses walletAuth from MiniKit - NO backend SIWE verification needed
 */

'use client'

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWalletAuth } from "@/lib/worldcoin/useWalletAuth";
import { isInWorldApp } from "@/lib/worldcoin/initMiniKit";

export function Header() {
  const { address, isConnected, isConnecting, connect, disconnect, error } = useWalletAuth();
  const [isWorldApp, setIsWorldApp] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check if in World App after mount (to avoid hydration issues)
  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setIsWorldApp(isInWorldApp());
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Format wallet address for display
   * Shows first 6 and last 4 characters
   */
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  /**
   * Handle connect button click
   */
  const handleConnect = async () => {
    const result = await connect();
    if (result.success) {
      console.log('✅ Wallet connected:', result.address);
    } else {
      console.error('❌ Connection failed:', result.error);
    }
  };

  // Don't render wallet section until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 w-full z-50 p-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-block">
            <Image
              src="/Isotype.png"
              alt="Marriage DAO Logo"
              width={60}
              height={60}
              priority
              className="hover:opacity-80 transition-opacity"
            />
          </Link>
          <div className="px-4 py-2 bg-black/5 rounded-full">
            <p className="text-sm text-black/40">...</p>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 p-6">
      <div className="flex items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="inline-block">
          <Image
            src="/Isotype.png"
            alt="Marriage DAO Logo"
            width={60}
            height={60}
            priority
            className="hover:opacity-80 transition-opacity"
          />
        </Link>

        {/* Wallet Connection - Right */}
        <div className="flex items-center gap-3">
          {isConnected && address ? (
            // Connected state
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-black/5 rounded-full">
                <p className="text-sm font-mono text-black">
                  {formatAddress(address)}
                </p>
              </div>
              <button
                onClick={disconnect}
                className="text-sm text-black/60 hover:text-black transition-colors"
              >
                Disconnect
              </button>
            </div>
          ) : isWorldApp ? (
            // In World App - show connect button
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="px-6 py-2 bg-black text-white rounded-full text-sm hover:bg-black/90 transition-colors disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            // Not in World App
            <div className="px-4 py-2 bg-amber-100 rounded-full">
              <p className="text-sm text-amber-700">Open in World App</p>
            </div>
          )}
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="absolute top-20 right-6 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
    </header>
  );
}
