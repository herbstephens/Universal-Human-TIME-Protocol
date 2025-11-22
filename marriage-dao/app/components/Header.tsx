/**
 * Purpose: Reusable Header component for Marriage DAO
 * Displays the logo in the top-left corner
 * Shows wallet connection button and address in the top-right
 */

'use client'

import Image from "next/image";
import Link from "next/link";
import { useWalletAuth } from "@/lib/worldcoin/useWalletAuth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { address, isConnected, isConnecting, connect, disconnect } = useWalletAuth()

  /**
   * Format wallet address for display
   * Shows first 6 and last 4 characters
   */
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  /**
   * Handle connect button click
   */
  const handleConnect = async () => {
    const result = await connect()
    if (result.success) {
      console.log('✅ Wallet connected:', result.address)
    } else {
      console.error('❌ Wallet connection failed:', result.error)
    }
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
          {!isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="bg-black text-white px-6 py-2 rounded-full hover:bg-black/90 disabled:opacity-50 text-sm"
            >
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              {/* Connected Address */}
              <div className="px-4 py-2 bg-black/5 rounded-full">
                <p className="text-sm font-mono text-black">
                  {address ? formatAddress(address) : 'Connected'}
                </p>
              </div>
              
              {/* Disconnect Button */}
              <button
                onClick={disconnect}
                className="text-sm text-black/60 hover:text-black transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

