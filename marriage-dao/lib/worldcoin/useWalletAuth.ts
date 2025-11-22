/**
 * Purpose: Custom hook for World App wallet authentication
 * Handles SIWE wallet authentication using MiniKit
 * Provides wallet address and authentication state
 * State persists in Zustand (localStorage)
 */

'use client'

import { useState, useCallback } from 'react'
import { MiniKit } from '@worldcoin/minikit-js'
import { isInWorldApp } from './initMiniKit'
import { useAuthStore } from '@/state/authStore'

/**
 * Custom hook for wallet authentication
 * 
 * Usage:
 * ```tsx
 * const { address, isConnected, connect, disconnect, isConnecting, error } = useWalletAuth()
 * 
 * const handleConnect = async () => {
 *   await connect()
 * }
 * ```
 */
export const useWalletAuth = () => {
  // Get wallet address from Zustand store (persisted)
  const { walletAddress, setWalletAddress, clearWallet } = useAuthStore()
  
  // Local loading/error state
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Connect wallet using MiniKit wallet authentication
   */
  const connect = useCallback(async () => {
    setIsConnecting(true)
    setError(null)

    try {
      // Check if running in World App
      if (!isInWorldApp()) {
        const errorMsg = 'This app must be opened in World App'
        setIsConnecting(false)
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }

      // Step 1: Get nonce from backend
      const nonceResponse = await fetch('/api/nonce')
      if (!nonceResponse.ok) {
        throw new Error('Failed to get nonce')
      }
      const { nonce } = await nonceResponse.json()

      // Step 2: Request wallet authentication from MiniKit
      const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
        nonce,
        requestId: '0',
        expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
        statement: 'Sign in to Marriage DAO to create your on-chain marriage proof',
      })

      // Check if user cancelled or error occurred
      if (finalPayload.status === 'error') {
        const errorMessage = 'Wallet authentication failed or was cancelled'
        setIsConnecting(false)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      // Step 3: Verify signature on backend
      const verifyResponse = await fetch('/api/complete-siwe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      })

      const verifyResult = await verifyResponse.json()

      if (!verifyResult.isValid) {
        const errorMessage = verifyResult.message || 'Signature verification failed'
        setIsConnecting(false)
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }

      // Success! Save wallet address to Zustand (persisted)
      const address = finalPayload.address || MiniKit.walletAddress
      setWalletAddress(address || '')
      setIsConnecting(false)
      setError(null)

      return { success: true, address }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Wallet connection failed'
      setIsConnecting(false)
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [setWalletAddress])

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    clearWallet()
    setError(null)
  }, [clearWallet])

  return {
    address: walletAddress,
    isConnected: !!walletAddress,
    isConnecting,
    error,
    connect,
    disconnect,
  }
}

