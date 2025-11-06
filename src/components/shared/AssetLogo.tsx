'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AssetLogoProps {
  asset: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function AssetLogo({ asset, size = 'md', className = '' }: AssetLogoProps) {
  const [imageError, setImageError] = useState(false)

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const getCryptoLogo = (asset: string) => {
    const assetLower = asset.toLowerCase()
    // Use CoinCap API for crypto logos
    return `https://assets.coincap.io/assets/icons/${assetLower}@2x.png`
  }

  const getInitials = (asset: string) => {
    return asset.slice(0, 2).toUpperCase()
  }

  // Color schemes based on first letter for fallback
  const getColorScheme = (asset: string) => {
    const firstLetter = asset.charAt(0).toUpperCase()
    const colorSchemes: Record<string, string> = {
      'B': 'from-orange-400 to-orange-600',
      'E': 'from-teal-400 to-teal-600',
      'T': 'from-cyan-500 to-blue-600',
      'S': 'from-teal-500 to-cyan-600',
      'X': 'from-fuchsia-500 to-pink-600',
      'D': 'from-green-400 to-green-600',
      'A': 'from-red-400 to-red-600',
      'U': 'from-blue-500 to-indigo-600',
      'M': 'from-pink-400 to-pink-600',
      'L': 'from-fuchsia-400 to-fuchsia-600',
    }
    return colorSchemes[firstLetter] || 'from-blue-400 to-blue-600'
  }

  if (imageError) {
    // Fallback: Circle with initials
    return (
      <div
        className={`${sizeClasses[size]} ${className} bg-gradient-to-br ${getColorScheme(asset)} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      >
        {getInitials(asset)}
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} ${className} relative flex-shrink-0`}>
      <Image
        src={getCryptoLogo(asset)}
        alt={asset}
        width={size === 'sm' ? 24 : size === 'md' ? 40 : 48}
        height={size === 'sm' ? 24 : size === 'md' ? 40 : 48}
        className="object-contain"
        onError={() => setImageError(true)}
        unoptimized
      />
    </div>
  )
}
