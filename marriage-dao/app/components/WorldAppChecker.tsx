/**
 * Purpose: Component to check World App status and redirect if not in World App
 * If the app is not running inside World App, shows a popup and redirects the user 
 * to download it from the App Store (iOS) or Play Store (Android)
 */

'use client'

import { useEffect, useState } from 'react'
import { isInWorldApp } from '@/lib/worldcoin/initMiniKit'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

// World App download links
const WORLD_APP_LINKS = {
  ios: 'https://apps.apple.com/us/app/worldcoin/id1560859847',
  android: 'https://play.google.com/store/apps/details?id=com.worldcoin',
  fallback: 'https://apps.apple.com/us/app/worldcoin/id1560859847'
}

// Detect user's platform
const detectPlatform = (): 'ios' | 'android' | 'desktop' => {
  if (typeof window === 'undefined') return 'desktop'
  
  const userAgent = navigator.userAgent || navigator.vendor
  
  // Detect iOS
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return 'ios'
  }
  
  // Detect Android
  if (/android/i.test(userAgent)) {
    return 'android'
  }
  
  return 'desktop'
}

export function WorldAppChecker() {
  const [isInWorld, setIsInWorld] = useState<boolean>(false)
  const [isMounted, setIsMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop'>('desktop')

  useEffect(() => {
    // Check if running in World App after mount
    setIsMounted(true)
    const inWorldApp = isInWorldApp()
    setIsInWorld(inWorldApp)
    
    // Detect platform
    const userPlatform = detectPlatform()
    setPlatform(userPlatform)

    // If NOT in World App, show dialog and start countdown
    if (!inWorldApp) {
      setShowDialog(true)
      
      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval)
            redirectToWorldApp(userPlatform)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(countdownInterval)
    }
  }, [])

  /**
   * Redirect to the appropriate app store based on platform
   */
  const redirectToWorldApp = (userPlatform: 'ios' | 'android' | 'desktop') => {
    let redirectUrl = WORLD_APP_LINKS.fallback
    
    if (userPlatform === 'ios') {
      redirectUrl = WORLD_APP_LINKS.ios
    } else if (userPlatform === 'android') {
      redirectUrl = WORLD_APP_LINKS.android
    }
    
    window.location.href = redirectUrl
  }

  /**
   * Handle manual redirect button click
   */
  const handleRedirectNow = () => {
    redirectToWorldApp(platform)
  }

  // Don't render anything during SSR (prevents hydration errors)
  if (!isMounted) {
    return null
  }

  // Get platform-specific text
  const getStoreText = () => {
    if (platform === 'ios') return 'App Store'
    if (platform === 'android') return 'Play Store'
    return 'App Store'
  }

  const getStoreIcon = () => {
    if (platform === 'ios') return '🍎'
    if (platform === 'android') return '🤖'
    return '🍎'
  }

  return (
    <>
      {/* Success indicator when in World App (optional - can be removed in production) */}
      {isInWorld && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="px-4 py-2 rounded-lg shadow-lg text-sm font-medium bg-black text-white border border-gray-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Running in World App ✓
            </div>
          </div>
        </div>
      )}

      {/* Redirect Dialog when NOT in World App */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white text-3xl border-2 border-gray-300">
                🌍
              </div>
            </div>
            <DialogTitle className="text-center text-2xl text-black">
              World App Required
            </DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-2">
              <p className="text-base text-gray-700">
                This app must be opened through <span className="font-semibold text-black">World App</span> to work properly.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <p className="text-sm text-gray-700">
                  You will be redirected to the <span className="font-semibold">{getStoreIcon()} {getStoreText()}</span> in:
                </p>
                <p className="text-4xl font-bold text-black mt-2">
                  {countdown}s
                </p>
              </div>

              <p className="text-xs text-gray-500">
                World App provides secure human verification for all users
              </p>
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button
              onClick={handleRedirectNow}
              className="w-full bg-black text-white hover:bg-gray-800"
              size="lg"
            >
              {getStoreIcon()} Download from {getStoreText()} Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

