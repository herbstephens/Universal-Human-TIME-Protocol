/**
 * Purpose: Global state store for user authentication and verification
 * Manages World ID verification status across the application
 * Uses Zustand for simple, efficient state management
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * User verification data
 */
export type VerificationData = {
  nullifier_hash: string
  verification_level: string
  verified_at: number // timestamp
}

/**
 * Auth store state
 */
type AuthState = {
  isVerified: boolean
  verificationData: VerificationData | null
  
  // Actions
  setVerified: (data: VerificationData) => void
  clearVerification: () => void
  checkVerificationExpiry: () => boolean
}

/**
 * Auth Store
 * Persists verification status to localStorage
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isVerified: false,
      verificationData: null,

      /**
       * Set user as verified
       */
      setVerified: (data: VerificationData) => {
        set({
          isVerified: true,
          verificationData: data,
        })
      },

      /**
       * Clear verification (logout)
       */
      clearVerification: () => {
        set({
          isVerified: false,
          verificationData: null,
        })
      },

      /**
       * Check if verification has expired (24 hours)
       * Returns true if still valid, false if expired
       */
      checkVerificationExpiry: () => {
        const { verificationData } = get()
        
        if (!verificationData) {
          return false
        }

        const now = Date.now()
        const hoursSinceVerification = (now - verificationData.verified_at) / (1000 * 60 * 60)
        
        // Expire after 24 hours
        if (hoursSinceVerification > 24) {
          get().clearVerification()
          return false
        }

        return true
      },
    }),
    {
      name: 'marriage-dao-auth', // localStorage key
    }
  )
)

