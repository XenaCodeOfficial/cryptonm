// Currency conversion utilities

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/USD'

type ExchangeRates = {
  rates: {
    EUR: number
    CHF: number
    USD: number
  }
}

// Cache for exchange rates (valid for 1 hour)
let cachedRates: ExchangeRates | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

/**
 * Fetch current exchange rates from API
 */
async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    const response = await fetch(EXCHANGE_RATE_API)
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching exchange rates:', error)
    // Fallback to approximate rates if API fails
    return {
      rates: {
        USD: 1,
        EUR: 0.92,
        CHF: 0.88,
      }
    }
  }
}

/**
 * Get exchange rates (with caching)
 */
async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now()

  // Return cached rates if still valid
  if (cachedRates && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedRates
  }

  // Fetch new rates
  cachedRates = await fetchExchangeRates()
  cacheTimestamp = now

  return cachedRates
}

/**
 * Convert any amount to USD
 */
export async function convertToUSD(amount: number, fromCurrency: string): Promise<number> {
  if (fromCurrency === 'USD') {
    return amount
  }

  const rates = await getExchangeRates()

  // Convert to USD
  // If we have 100 EUR and EUR rate is 0.92, then 100 EUR = 100 / 0.92 USD
  const rate = rates.rates[fromCurrency as keyof typeof rates.rates]
  if (!rate) {
    console.error(`Unknown currency: ${fromCurrency}`)
    return amount
  }

  const usdAmount = amount / rate
  return Math.round(usdAmount * 100) / 100 // Round to 2 decimals
}

/**
 * Convert USD to any currency
 */
export async function convertFromUSD(usdAmount: number, toCurrency: string): Promise<number> {
  if (toCurrency === 'USD') {
    return usdAmount
  }

  const rates = await getExchangeRates()

  const rate = rates.rates[toCurrency as keyof typeof rates.rates]
  if (!rate) {
    console.error(`Unknown currency: ${toCurrency}`)
    return usdAmount
  }

  const convertedAmount = usdAmount * rate
  return Math.round(convertedAmount * 100) / 100 // Round to 2 decimals
}

/**
 * Get current exchange rate for display
 */
export async function getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
  if (fromCurrency === toCurrency) {
    return 1
  }

  const rates = await getExchangeRates()

  const fromRate = rates.rates[fromCurrency as keyof typeof rates.rates] || 1
  const toRate = rates.rates[toCurrency as keyof typeof rates.rates] || 1

  return toRate / fromRate
}
