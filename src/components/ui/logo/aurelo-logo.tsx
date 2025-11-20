"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { useState, useEffect } from "react"

export function AureloLogo({ className = "w-10 h-10" }: { className?: string }) {
  const [imageError, setImageError] = useState(false)
  const [currentFormat, setCurrentFormat] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  
  // Tenta diferentes formatos e nomes de imagem
  const imageFormats = [
    '/aurelo-logo.png',
    '/aurelo-logo.jpg', 
    '/aurelo-logo.jpeg',
    '/aurelo-logo.webp',
    '/aurelo-logo.svg',
    '/logo.png',
    '/logo.jpg',
    '/logo.svg'
  ]

  useEffect(() => {
    // Reset states when format changes
    setImageError(false)
    setImageLoaded(false)
  }, [currentFormat])

  const handleImageError = () => {
    if (currentFormat < imageFormats.length - 1) {
      // Tenta próximo formato
      setTimeout(() => {
        setCurrentFormat(currentFormat + 1)
      }, 100)
    } else {
      // Todos os formatos falharam, usa fallback
      setImageError(true)
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  // Fallback SVG caso nenhuma imagem seja encontrada
  if (imageError) {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <motion.path
          d="M50 10C27.9086 10 10 27.9086 10 50C10 72.0914 27.9086 90 50 90C72.0914 90 90 72.0914 90 50C90 27.9086 72.0914 10 50 10Z"
          className="fill-primary/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M50 25C36.1929 25 25 36.1929 25 50C25 63.8071 36.1929 75 50 75C63.8071 75 75 63.8071 75 50C75 36.1929 63.8071 25 50 25Z"
          className="fill-primary"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
        <path
          d="M50 35C41.7157 35 35 41.7157 35 50C35 58.2843 41.7157 65 50 65C58.2843 65 65 58.2843 65 50C65 41.7157 58.2843 35 50 35Z"
          className="fill-accent"
          fillOpacity="0.8"
        />
      </svg>
    )
  }

  const isSvg = imageFormats[currentFormat].endsWith('.svg')
  const currentSrc = imageFormats[currentFormat]

  return (
    <motion.div
      className={`${className} relative flex items-center justify-center`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: imageLoaded ? 1 : 0.5, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Image
        src={currentSrc}
        alt="Aurelo Logo"
        width={100}
        height={100}
        className={`w-full h-full object-contain`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        priority
        unoptimized={isSvg}
        style={{ 
          objectFit: 'contain',
          maxWidth: '100%',
          height: 'auto'
        }}
      />
    </motion.div>
  )
}

