/**
 * Purpose: Complete SIWE wallet authentication
 * Verifies the signature from World App wallet authentication
 * Validates the nonce matches the one we generated
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { MiniAppWalletAuthSuccessPayload, verifySiweMessage } from '@worldcoin/minikit-js'

/**
 * Request payload type
 */
interface IRequestPayload {
  payload: MiniAppWalletAuthSuccessPayload
  nonce: string
}

/**
 * POST /api/complete-siwe
 * 
 * Verifies the SIWE signature from World App
 * 
 * Request body:
 * - payload: The wallet auth response from MiniKit
 * - nonce: The nonce that was used
 * 
 * Returns:
 * - 200: { status: 'success', isValid: true, address: string } if valid
 * - 400: { status: 'error', isValid: false, message: string } if invalid
 */
export async function POST(req: NextRequest) {
  try {
    const { payload, nonce } = (await req.json()) as IRequestPayload
    
    // Get the stored nonce from cookies
    const cookieStore = await cookies()
    const storedNonce = cookieStore.get('siwe')?.value
    
    // Verify nonce matches
    if (nonce !== storedNonce) {
      return NextResponse.json(
        {
          status: 'error',
          isValid: false,
          message: 'Invalid nonce',
        },
        { status: 400 }
      )
    }
    
    // Verify the SIWE message signature
    const validMessage = await verifySiweMessage(payload, nonce)
    
    if (!validMessage.isValid) {
      return NextResponse.json(
        {
          status: 'error',
          isValid: false,
          message: 'Invalid signature',
        },
        { status: 400 }
      )
    }
    
    // Clear the nonce cookie after successful verification
    cookieStore.delete('siwe')
    
    // Return success with wallet address
    return NextResponse.json({
      status: 'success',
      isValid: true,
      address: payload.address,
    })
    
  } catch (error: any) {
    console.error('Error verifying SIWE message:', error)
    return NextResponse.json(
      {
        status: 'error',
        isValid: false,
        message: error.message || 'Verification failed',
      },
      { status: 500 }
    )
  }
}

