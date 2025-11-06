'use client'

import { useRealtimePrice } from '@/hooks/useRealtimePrice'
import { useCurrency } from '@/components/providers/CurrencyProvider'

type RealtimePriceProps = {
  asset: string
  className?: string
}

export default function RealtimePrice({ asset, className = '' }: RealtimePriceProps) {
  const { price, loading, error } = useRealtimePrice(asset)
  const { currency, convertAmount } = useCurrency()

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
      </div>
    )
  }

  if (error || price === null) {
    return (
      <span className={`text-gray-400 dark:text-gray-600 ${className}`}>
        —
      </span>
    )
  }

  // Convert price to user's currency
  const converted = convertAmount(price)

  // Get locale based on currency
  const getLocale = () => {
    switch (currency) {
      case 'USD':
        return 'en-US' // 1,000.50
      case 'EUR':
        return 'de-DE' // 1.000,50
      case 'CHF':
        return 'de-CH' // 1'000.50 or 1 000,50
      default:
        return 'en-US'
    }
  }

  // Format price with appropriate decimals based on value
  const formatPrice = (value: number): string => {
    const CURRENCY_SYMBOLS = {
      USD: '$',
      EUR: '€',
      CHF: 'CHF',
    }
    const symbol = CURRENCY_SYMBOLS[currency]

    let formatted: string

    if (value >= 1) {
      // For prices >= $1, use 2 decimals
      formatted = new Intl.NumberFormat(getLocale(), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    } else if (value >= 0.01) {
      // For prices >= $0.01, use 4 decimals
      formatted = new Intl.NumberFormat(getLocale(), {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(value)
    } else {
      // For prices < $0.01, use 6 decimals
      formatted = new Intl.NumberFormat(getLocale(), {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }).format(value)
    }

    return currency === 'USD' ? `${symbol}${formatted}` : `${formatted} ${symbol}`
  }

  return (
    <span className={className}>
      {formatPrice(converted)}
    </span>
  )
}
