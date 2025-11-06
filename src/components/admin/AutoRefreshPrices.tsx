'use client'

import { useAutoRefreshPrices } from '@/hooks/useAutoRefreshPrices'
import { useEffect, useState } from 'react'

type AutoRefreshPricesProps = {
  clientId: string
}

export default function AutoRefreshPrices({ clientId }: AutoRefreshPricesProps) {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const { refreshPrices } = useAutoRefreshPrices(clientId, true)

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

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
        onClick={() => {
          refreshPrices()
          setLastUpdate(new Date())
        }}
        className="hover:text-blue-500 transition-colors"
      >
        Actualiser maintenant
      </button>
    </div>
  )
}
