"use client"

import { useState, useEffect } from "react"
import { SplashScreen } from "@/components/ui/logo/splash-screen"
import { AnimatePresence } from "framer-motion"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(false)

  useEffect(() => {
    // Check if user has seen splash before in this session
    const hasSeenSplash = sessionStorage.getItem('aurelo-splash-seen')
    
    if (!hasSeenSplash) {
      setShowSplash(true)
      sessionStorage.setItem('aurelo-splash-seen', 'true')
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      </AnimatePresence>
      {!showSplash && children}
    </>
  )
}
