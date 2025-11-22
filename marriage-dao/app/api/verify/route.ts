/**
 * Purpose: Backend API route for verifying World ID proofs
 * This route receives proofs from the frontend and verifies them
 * using the World ID Cloud Verifier API
 * 
 * IMPORTANT: Proofs must ALWAYS be verified on the backend to prevent
 * users from manipulating verification results in the frontend
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyCloudProof, IVerifyResponse, ISuccessResult } from '@worldcoin/minikit-js'

/**
 * Request payload structure from frontend
 */
interface IRequestPayload {
  payload: ISuccessResult
  action: string
  signal?: string
}

/**
 * POST /api/verify
 * Verifies a World ID proof received from the frontend
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const { payload, action, signal } = (await req.json()) as IRequestPayload

    // Validate required fields
    if (!payload || !action) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: payload and action are required',
          status: 400 
        },
        { status: 400 }
      )
    }

    // Get APP_ID from environment
    const app_id = process.env.NEXT_PUBLIC_WORLD_APP_ID as `app_${string}`
    
    if (!app_id || !app_id.startsWith('app_')) {
      return NextResponse.json(
        { 
          error: 'Invalid or missing NEXT_PUBLIC_WORLD_APP_ID in environment',
          status: 500 
        },
        { status: 500 }
      )
    }

    // Verify the proof using World ID Cloud Verifier
    const verifyRes = (await verifyCloudProof(
      payload, 
      app_id, 
      action, 
      signal
    )) as IVerifyResponse

    // Handle verification result
    if (verifyRes.success) {
      // ✅ Verification successful
      // This is where you would:
      // - Mark user as verified in database
      // - Grant access to protected functionality
      // - Create marriage proposal/accept it
      console.log('✅ World ID verification successful:', {
        nullifier_hash: payload.nullifier_hash,
        action,
      })

      return NextResponse.json({ 
        verifyRes, 
        status: 200 
      })
    } else {
      // ❌ Verification failed
      // Common reasons:
      // - User already verified this action (duplicate nullifier)
      // - Invalid proof
      // - Proof expired
      console.error('❌ World ID verification failed:', verifyRes)

      return NextResponse.json({ 
        verifyRes, 
        status: 400,
        error: verifyRes.detail || 'Verification failed'
      }, { status: 400 })
    }
  } catch (error) {
    // Handle unexpected errors
    console.error('Error in verification route:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal server error during verification',
        status: 500 
      },
      { status: 500 }
    )
  }
}

