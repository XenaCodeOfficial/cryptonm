'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Currency = 'USD' | 'EUR' | 'CHF'

type ExchangeRates = {
  USD: number
  EUR: number
  CHF: number
}

type CurrencyContextType = {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatAmount: (amount: number) => string
  convertAmount: (amount: number, fromCurrency?: Currency) => number
  exchangeRates: ExchangeRates
  lastUpdated: string | null
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Fallback exchange rates (base: USD) - used only if API fails
const FALLBACK_EXCHANGE_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  CHF: 0.88,
}

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '€',
  CHF: 'CHF',
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD')
  const [mounted, setMounted] = useState(false)
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>(FALLBACK_EXCHANGE_RATES)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Fetch real-time exchange rates
  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch('/api/exchange-rates')
        if (response.ok) {
          const data = await response.json()
          setExchangeRates(data.rates)
          setLastUpdated(data.lastUpdated)
          console.log('✓ Exchange rates updated:', data.rates, 'Date:', data.lastUpdated)
        }
      } catch (error) {
        console.error('Failed to fetch exchange rates:', error)
        // Keep using fallback rates
      }
    }

    fetchExchangeRates()

    // Refresh rates every hour
    const intervalId = setInterval(fetchExchangeRates, 60 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    setMounted(true)
    const savedCurrency = localStorage.getItem('currency') as Currency
    if (savedCurrency) {
      setCurrencyState(savedCurrency)
    }
  }, [])

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    if (mounted) {
      localStorage.setItem('currency', newCurrency)
    }
  }

  const convertAmount = (amount: number, fromCurrency: Currency = 'USD'): number => {
    // Convert from source currency to USD first
    const amountInUSD = amount / exchangeRates[fromCurrency]
    // Then convert from USD to target currency
    return amountInUSD * exchangeRates[currency]
  }

  const formatAmount = (amount: number): string => {
    const converted = convertAmount(amount)
    const symbol = CURRENCY_SYMBOLS[currency]

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

    const formatted = new Intl.NumberFormat(getLocale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted)

    return currency === 'USD' ? `${symbol}${formatted}` : `${formatted} ${symbol}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, convertAmount, exchangeRates, lastUpdated }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
