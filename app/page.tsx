'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

interface FloatingWord {
  id: number
  text: string
  x: number
  y: number
  createdAt: number
  velocityX: number
  velocityY: number
  rotation: number
  rotationSpeed: number
  startMovingAt: number
}

export default function Home() {
  const [timeOfDay, setTimeOfDay] = useState('')
  const [isClicked, setIsClicked] = useState(false)
  const [floatingWords, setFloatingWords] = useState<FloatingWord[]>([])
  const [canClick, setCanClick] = useState(true)

  useEffect(() => {
    const updateTimeOfDay = () => {
      const now = new Date()
      const hour = now.getHours()
      
      if (hour >= 5 && hour < 8) {
        setTimeOfDay('dawn') // 5-8 AM: Sunrise/dawn
      } else if (hour >= 8 && hour < 12) {
        setTimeOfDay('morning') // 8-12 PM: Morning
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('afternoon') // 12-5 PM: Afternoon
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('evening') // 5-8 PM: Evening
      } else {
        setTimeOfDay('night') // 8 PM-5 AM: Night
      }
    }

    updateTimeOfDay()
    
    // Update every minute
    const interval = setInterval(updateTimeOfDay, 60000)
    
    return () => clearInterval(interval)
  }, [])

  // Animate floating words
  useEffect(() => {
    const animate = () => {
      setFloatingWords(prev => 
        prev.map(word => {
          const age = Date.now() - word.createdAt
          if (age > 10000) return null // Mark for removal after 10 seconds
          
          // Check if it's time to start moving
          const timeSinceCreated = Date.now() - word.createdAt
          const shouldStartMoving = timeSinceCreated >= word.startMovingAt
          
          if (!shouldStartMoving) {
            // Stay in original position until it's time to move
            return word
          }
          
          // Calculate movement time (age since movement started)
          const movementAge = timeSinceCreated - word.startMovingAt
          
          // Update position based on velocity (only after movement starts)
          const newX = word.x + word.velocityX * 0.016 // 60fps
          const newY = word.y + word.velocityY * 0.016
          const newRotation = word.rotation + word.rotationSpeed * 0.016
          
          // Add gentle drift and wind effects
          const windEffect = Math.sin(movementAge / 3000) * 0.8 + Math.cos(movementAge / 4000) * 0.6
          const driftY = Math.sin(movementAge / 4000) * 0.6 + Math.cos(movementAge / 5000) * 0.4
          const turbulence = Math.sin(movementAge / 2000) * 0.3
          
          return {
            ...word,
            x: newX + windEffect + turbulence,
            y: newY + driftY + turbulence * 0.5,
            rotation: newRotation
          }
        }).filter(word => word !== null) as FloatingWord[]
      )
    }

    const interval = setInterval(animate, 16) // ~60fps
    return () => clearInterval(interval)
  }, [])

  const handleWishingWellClick = () => {
    if (!canClick) return // Prevent clicking during cooldown
    
    setIsClicked(!isClicked)
    setCanClick(false) // Start cooldown period
    
    // Force the GIF to restart by adding a timestamp to the src
    const currentSrc = isClicked ? "/wishingwell(steady)-2.gif" : "/wishingwell(middle)-2.gif"
    const newSrc = currentSrc + "?t=" + Date.now()
    
    // Update the src to force reload
    setTimeout(() => {
      const img = document.querySelector('img') as HTMLImageElement
      if (img) {
        img.src = newSrc
      }
    }, 50)
    
    // Re-enable clicking after 10 seconds
    setTimeout(() => {
      setCanClick(true)
    }, 10000)

    // Add floating words
    const messages = [
      "I still listen to the songs you sent me",
      "Call your mom",
      "Sit still and see how long you can be comfortable with the silence"
    ]
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    const words = randomMessage.split(' ')
    
    // Create individual words with dynamic spacing based on actual word widths
    const wordsPerLine = 4 // Maximum words per line
    const lineHeight = 40 // Vertical spacing between lines
    const minSpacing = 20 // Minimum spacing between words
    
    // Helper function to measure text width
    const measureText = (text: string): number => {
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      if (context) {
        context.font = '18px Poppins, sans-serif'
        return context.measureText(text).width
      }
      return text.length * 10 // Fallback estimate
    }
    
    const newWords: FloatingWord[] = words.map((word, index) => {
      // Calculate which line this word should be on
      const lineIndex = Math.floor(index / wordsPerLine)
      const wordIndexInLine = index % wordsPerLine
      
      // Get words in this line
      const lineStartIndex = lineIndex * wordsPerLine
      const lineEndIndex = Math.min(lineStartIndex + wordsPerLine, words.length)
      const wordsInThisLine = words.slice(lineStartIndex, lineEndIndex)
      
      // Calculate where the left edge of this word should be
      let leftEdgePosition = 0
      for (let i = 0; i < wordIndexInLine; i++) {
        const prevWord = wordsInThisLine[i]
        const prevWordWidth = measureText(prevWord)
        // Add the width of the previous word plus spacing
        leftEdgePosition += prevWordWidth + minSpacing
      }
      
      // Calculate total line width for centering
      const totalLineWidth = wordsInThisLine.reduce((total, w) => {
        return total + measureText(w) + minSpacing
      }, 0) - minSpacing // Remove last spacing since there's no word after the last one
      
      // Since the word is centered with translate(-50%, -50%), we need to position its center
      // at leftEdgePosition + halfWordWidth to make its left edge start at leftEdgePosition
      const currentWordWidth = measureText(word)
      const startX = leftEdgePosition + (currentWordWidth / 2) - (totalLineWidth / 2)
      const startY = (lineIndex - (Math.ceil(words.length / wordsPerLine) - 1) / 2) * lineHeight
      
      // Slightly different velocities for each word
      const angle = Math.random() * 2 * Math.PI // Random angle in radians
      const speed = Math.random() * 12 + 3 + (index * 0.5) // Slightly different speeds
      const velocityX = Math.cos(angle) * speed
      const velocityY = Math.sin(angle) * speed
      const rotation = (Math.random() - 0.5) * 15 // -7.5 to 7.5 degrees initial rotation
      const rotationSpeed = (Math.random() - 0.5) * 30 // -15 to 15 degrees per second
      
      return {
        id: Date.now() + Math.random() + index,
        text: word,
        x: startX,
        y: startY,
        createdAt: Date.now() + (index * 50), // Shorter delay for faster appearance
        velocityX,
        velocityY,
        rotation,
        rotationSpeed,
        startMovingAt: 3000 + (index * 50) // Start moving after 3 seconds + small delay
      }
    })
    
    setFloatingWords(prev => [...prev, ...newWords])
  }

  const getBackgroundClass = () => {
    switch (timeOfDay) {
      case 'dawn':
        return 'bg-gradient-to-br from-orange-200 via-pink-200 to-yellow-200'
      case 'morning':
        return 'bg-gradient-to-br from-yellow-200 via-orange-100 to-blue-100'
      case 'afternoon':
        return 'bg-gradient-to-br from-blue-200 via-sky-200 to-blue-100'
      case 'evening':
        return 'bg-gradient-to-br from-purple-200 via-pink-200 to-orange-200'
      case 'night':
        return 'bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900'
      default:
        return 'bg-blue-100'
    }
  }

  return (
    <main className={`min-h-screen ${getBackgroundClass()} flex items-center justify-center transition-all duration-1000 relative`}>
      <div className="relative">
        <Image 
          key={isClicked ? "middle" : "steady"}
          src={isClicked ? "/wishingwell(middle)-2.gif" : "/wishingwell(steady)-2.gif"}
          alt="Wishing Well" 
          width={800} 
          height={600}
          className={`max-w-full h-auto transition-transform duration-300 ${
            canClick 
              ? 'cursor-pointer hover:scale-105' 
              : 'cursor-default'
          }`}
          onClick={handleWishingWellClick}
          unoptimized
          priority
        />
        
        {/* Floating Words */}
        {floatingWords.map((word) => {
          const age = Date.now() - word.createdAt
          // More natural fade: stays visible for 7 seconds, then fades over 3 seconds
          const fadeStart = 7000
          const fadeDuration = 3000
          const opacity = age < fadeStart ? 1 : Math.max(0, 1 - ((age - fadeStart) / fadeDuration))
          const scale = Math.max(0.7, 1 - (age / 20000)) // Very gradual scale down
          
          return (
            <div
              key={word.id}
              className="absolute pointer-events-none select-none"
              style={{
                left: `calc(50% + ${word.x}px)`,
                top: `calc(50% + ${word.y}px)`,
                transform: `translate(-50%, -50%) rotate(${word.rotation}deg) scale(${scale})`,
                opacity: opacity,
                transition: 'opacity 0.1s ease-out'
              }}
            >
              <span className="text-lg font-medium text-white drop-shadow-lg whitespace-nowrap">
                {word.text}
              </span>
            </div>
          )
        })}
      </div>
    </main>
  )
}
