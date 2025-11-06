import { useState, useEffect } from 'react'

export function useRealtimePrice(symbol: string) {
  const [price, setPrice] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchPrice = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/crypto/price?symbol=${symbol}`)

        if (!response.ok) {
          throw new Error('Failed to fetch price')
        }

        const data = await response.json()

        if (isMounted) {
          setPrice(data.price)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Fetch immediately
    fetchPrice()

    // Then fetch every 30 seconds
    const interval = setInterval(fetchPrice, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [symbol])

  return { price, loading, error }
}
