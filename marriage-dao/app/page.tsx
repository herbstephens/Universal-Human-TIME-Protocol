/**
 * Purpose: Homepage for Marriage DAO
 * Landing page with World ID verification before accessing the app
 * Users must verify as human before proceeding
 */

'use client'

import { Header } from "./components/Header";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useWorldVerification } from "@/lib/worldcoin/useWorldVerification";
import { WORLD_ACTIONS } from "@/lib/worldcoin/initMiniKit";
import { useAuthStore } from "@/state/authStore";
import { isInWorldApp } from "@/lib/worldcoin/initMiniKit";

export default function Home() {
  const router = useRouter();
  const { verify, isVerifying, error } = useWorldVerification();
  const { setVerified, isVerified, checkVerificationExpiry } = useAuthStore();
  const [showError, setShowError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  /**
   * Mark component as mounted
   * We don't auto-redirect, let the user click the button
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Handle "Get started" button click
   * Verifies user with World ID before allowing access
   */
  const handleGetStarted = async () => {
    setShowError(null);

    // If already verified, just navigate
    if (isVerified && checkVerificationExpiry()) {
      router.push("/home");
      return;
    }

    try {
      // Request World ID verification
      // The verify function will check if in World App internally
      const result = await verify(
        WORLD_ACTIONS.CREATE_PROPOSAL, // Using create proposal action for general access
        undefined, // No signal needed for general access
      );

      if (!result.success) {
        setShowError(result.error || "Verification failed. Please try again.");
        return;
      }

      // Save verification to store (including proof for on-chain verification)
      setVerified({
        proof: result.proof!,
        merkle_root: result.merkle_root!,
        nullifier_hash: result.nullifier_hash!,
        verification_level: result.verification_level!,
        verified_at: Date.now(),
      });

      // Navigate to home
      router.push("/home");
    } catch (err) {
      console.error("Verification error:", err);
      setShowError("An unexpected error occurred. Please try again.");
    }
  };

  // Don't render World App specific UI until mounted (prevents hydration mismatch)
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#E8E8E8] flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="flex flex-col items-center text-center space-y-8 max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-black tracking-tight">
              Marriage Dao
            </h1>
            <p className="text-2xl md:text-3xl font-light text-black/70 tracking-wide">
              Get married On Chain
            </p>
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
        <div className="flex flex-col items-center text-center space-y-8 max-w-2xl">
          {/* Title */}
          <h1 className="text-5xl md:text-6xl font-bold text-black tracking-tight">
            Marriage Dao
          </h1>

          {/* Subtitle */}
          <p className="text-2xl md:text-3xl font-light text-black/70 tracking-wide">
            Get married On Chain
          </p>

          {/* CTA Button - now with World ID verification */}
          <button
            onClick={handleGetStarted}
            disabled={isVerifying}
            className="mt-4 bg-black text-white px-12 py-4 rounded-full text-lg font-medium hover:bg-black/90 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isVerifying 
              ? "Verifying..." 
              : isVerified && checkVerificationExpiry()
              ? "Continue"
              : "Get started"}
          </button>

          {/* Error message */}
          {(showError || error) && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-lg text-red-700 max-w-md">
              <p className="text-sm">{showError || error}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
