"use client"

import { motion } from "framer-motion"
import { AureloLogo } from "./aurelo-logo"
import { useEffect, useState } from "react"

export function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2500)
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.1
          }}
        >
          <AureloLogo className="w-28 h-28" />
        </motion.div>
        <motion.h1
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            delay: 0.4,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
        >
          Aurelo
        </motion.h1>
        <motion.p
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          Assistente de Carreira
        </motion.p>
      </div>
    </motion.div>
  )
}
