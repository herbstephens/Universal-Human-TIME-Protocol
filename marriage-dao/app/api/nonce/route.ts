/**
 * Purpose: Generate nonce for SIWE wallet authentication
 * Creates a secure nonce that will be used to verify the wallet signature
 * The nonce must be at least 8 alphanumeric characters
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/nonce
 * 
 * Generates a random nonce for SIWE authentication
 * Stores it in a secure cookie to prevent tampering
 * 
 * Returns:
 * { nonce: string }
 */
export async function GET(req: NextRequest) {
  // Generate nonce - expects only alphanumeric characters
  // Using crypto.randomUUID() and removing dashes
  const nonce = crypto.randomUUID().replace(/-/g, '')
  
  // Store nonce in secure cookie
  // This prevents the client from tampering with it
  // The cookie will be verified when completing the sign in
  const cookieStore = await cookies()
  cookieStore.set('siwe', nonce, { 
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 60 * 10, // 10 minutes
  })
  
  return NextResponse.json({ nonce })
}

