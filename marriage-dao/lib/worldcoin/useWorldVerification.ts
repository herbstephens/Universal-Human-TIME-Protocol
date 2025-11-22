/**
 * Purpose: Custom React hook for World ID verification in Mini Apps
 * Provides an easy-to-use interface for verifying users with World ID
 * using the MiniKit verify command
 */

'use client'

import { useState, useCallback } from 'react'
import { 
  MiniKit, 
  VerifyCommandInput, 
  VerificationLevel,
  ISuccessResult,
  MiniAppVerifyActionPayload 
} from '@worldcoin/minikit-js'
import { isInWorldApp, type WorldAction } from './initMiniKit'

/**
 * Verification result type
 */
export type VerificationResult = {
  success: boolean
  proof?: string
  merkle_root?: string
  nullifier_hash?: string
  verification_level?: VerificationLevel
  error?: string
}

/**
 * Hook state
 */
type UseWorldVerificationState = {
  isVerifying: boolean
  error: string | null
}

/**
 * Custom hook for World ID verification
 * 
 * Usage:
 * ```tsx
 * const { verify, isVerifying, error } = useWorldVerification()
 * 
 * const handleVerify = async () => {
 *   const result = await verify({
 *     action: 'create-marriage-proposal',
 *     signal: userAddress, // Optional
 *   })
 *   
 *   if (result.success) {
 *     console.log('Verified!', result.proof)
 *   }
 * }
 * ```
 */
export const useWorldVerification = () => {
  const [state, setState] = useState<UseWorldVerificationState>({
    isVerifying: false,
    error: null,
  })

  /**
   * Verify user with World ID
   * @param action - The action ID from Developer Portal
   * @param signal - Optional signal (e.g., wallet address)
   * @param verificationLevel - Orb or Device (default: Orb)
   */
  const verify = useCallback(async (
    action: WorldAction,
    signal?: string,
    verificationLevel: VerificationLevel = VerificationLevel.Orb
  ): Promise<VerificationResult> => {
    setState({ isVerifying: true, error: null })

    try {
      // Check if running in World App
      if (!isInWorldApp()) {
        const error = 'This app must be opened in World App'
        setState({ isVerifying: false, error })
        return { success: false, error }
      }

      // Prepare verification payload
      const verifyPayload: VerifyCommandInput = {
        action,
        signal,
        verification_level: verificationLevel,
      }

      // Call MiniKit verify command (async version)
      const { finalPayload } = await MiniKit.commandsAsync.verify(verifyPayload)

      // Check if user cancelled or error occurred
      if (finalPayload.status === 'error') {
        const errorMessage = 'Verification failed or was cancelled'
        setState({ isVerifying: false, error: errorMessage })
        return { success: false, error: errorMessage }
      }

      // Success! Return the proof
      setState({ isVerifying: false, error: null })
      return {
        success: true,
        proof: finalPayload.proof,
        merkle_root: finalPayload.merkle_root,
        nullifier_hash: finalPayload.nullifier_hash,
        verification_level: finalPayload.verification_level,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Verification failed'
      setState({ isVerifying: false, error: errorMessage })
      return { success: false, error: errorMessage }
    }
  }, [])

  /**
   * Verify the proof on the backend
   * This should be called after getting the proof from verify()
   * 
   * @param payload - The success payload from verify()
   * @param action - The action ID used for verification
   * @param signal - The signal used for verification (optional)
   */
  const verifyProofOnBackend = useCallback(async (
    payload: ISuccessResult,
    action: WorldAction,
    signal?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload,
          action,
          signal,
        }),
      })

      const result = await response.json()
      return result.status === 200 && result.verifyRes?.success
    } catch (err) {
      console.error('Backend verification failed:', err)
      return false
    }
  }, [])

  return {
    verify,
    verifyProofOnBackend,
    isVerifying: state.isVerifying,
    error: state.error,
  }
}

