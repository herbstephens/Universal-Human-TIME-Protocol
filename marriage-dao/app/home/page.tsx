/**
 * Purpose: Home page for Marriage DAO (Protected Route)
 * Shows two options: Make a Proposal or Accept a Proposal
 * If user is already married, shows "You are already married" message
 * Requires World ID verification to access
 */

'use client'

import { Header } from "../components/Header";
import Link from "next/link";
import { useAuthStore } from "@/state/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWalletAuth } from "@/lib/worldcoin/useWalletAuth";

export default function HomePage() {
  const router = useRouter();
  const { isVerified, checkVerificationExpiry, verificationData } = useAuthStore();
  const { isConnected, address } = useWalletAuth();
  const [isLoading, setIsLoading] = useState(true);

  // TODO: Check if user is married when blockchain is integrated
  const isMarried = false;

  // Debug: Log connection state
  useEffect(() => {
    console.log('🔍 Home Page - Wallet State:', { isConnected, address })
  }, [isConnected, address])

  /**
   * Check if user is verified before showing content
   * Redirect to landing page if not verified
   */
  useEffect(() => {
    // Check verification status
    const isValid = checkVerificationExpiry();

    if (!isVerified || !isValid) {
      // Not verified or verification expired - redirect to landing
      router.replace("/");
      return;
    }

    // User is verified - show content
    setIsLoading(false);
  }, [isVerified, checkVerificationExpiry, router]);

  // Show loading state while checking verification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-black/70">Checking verification...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
      {/* Header with logo */}
      <Header />

      {/* Main content - centered */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        {!isMarried ? (
          <div className="flex flex-col items-center text-center space-y-8 max-w-md w-full">
            {/* Verification Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-400 rounded-full text-green-700 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Verified Human</span>
              {verificationData?.verification_level && (
                <span className="text-xs opacity-70">
                  ({verificationData.verification_level})
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-normal text-black tracking-tight">
              Time to get Married
            </h1>

            {/* Button Container - Only show if wallet is connected */}
            {isConnected ? (
              <div className="bg-[#C4C4C4] rounded-3xl p-8 w-full space-y-4">
                {/* Make a Proposal Button */}
                <Link
                  href="/marriage/create"
                  className="block w-full bg-black text-white px-8 py-4 rounded-full text-lg font-normal hover:bg-black/90 transition-all duration-200"
                >
                  Make a Proposal
                </Link>

                {/* Accept a Proposal Button */}
                <Link
                  href="/marriage/accept"
                  className="block w-full bg-black text-white px-8 py-4 rounded-full text-lg font-normal hover:bg-black/90 transition-all duration-200"
                >
                  Accept a Proposal
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <p className="text-black/60 text-base">
                  Connect your wallet to continue
                </p>
                <p className="text-black/40 text-sm">
                  👆 Use the button in the top right
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-8">
            <h2 className="text-3xl font-normal text-black">
              You are already married
            </h2>
            {/* TODO: Add MarriageStatus component here when ready */}
          </div>
        )}
      </main>
    </div>
  );
}

