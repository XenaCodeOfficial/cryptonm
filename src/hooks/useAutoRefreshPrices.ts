import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useAutoRefreshPrices(clientId: string, enabled: boolean = true) {
  const router = useRouter()

  const refreshPrices = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/refresh-prices`, {
        method: 'POST',
      })

      if (response.ok) {
        // Refresh the page data
        router.refresh()
      }
    } catch (error) {
      console.error('Error refreshing prices:', error)
    }
  }, [clientId, router])

  useEffect(() => {
    if (!enabled) return

    // Refresh immediately on mount
    refreshPrices()

    // Then refresh every 60 seconds
    const interval = setInterval(refreshPrices, 60000)

    return () => clearInterval(interval)
  }, [refreshPrices, enabled])

  return { refreshPrices }
}
