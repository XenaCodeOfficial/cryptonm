'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRefreshPrices() {
  const router = useRouter()
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const refreshPrices = useCallback(async () => {
    try {
      const response = await fetch(`/api/client/refresh-prices`, {
        method: 'POST',
      })

      if (response.ok) {
        setLastUpdate(new Date())
        // Refresh the page data
        router.refresh()
      }
    } catch (error) {
      console.error('Error refreshing prices:', error)
    }
  }, [router])

  useEffect(() => {
    // Refresh immediately on mount
    refreshPrices()

    // Then refresh every 60 seconds
    const interval = setInterval(refreshPrices, 60000)

    return () => clearInterval(interval)
  }, [refreshPrices])

  const getTimeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000)
    if (seconds < 60) return `il y a ${seconds}s`
    const minutes = Math.floor(seconds / 60)
    return `il y a ${minutes}min`
  }

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Prix en temps réel</span>
      </div>
      <span>•</span>
      <button
        onClick={refreshPrices}
        className="hover:text-blue-500 transition-colors"
      >
        Actualiser maintenant
      </button>
    </div>
  )
}
