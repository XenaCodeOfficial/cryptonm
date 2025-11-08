import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY

// Map common symbols to CoinGecko IDs
const SYMBOL_TO_ID_MAP: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'USDT': 'tether',
  'BNB': 'binancecoin',
  'SOL': 'solana',
  'XRP': 'ripple',
  'USDC': 'usd-coin',
  'ADA': 'cardano',
  'DOGE': 'dogecoin',
  'TRX': 'tron',
  'TON': 'the-open-network',
  'LINK': 'chainlink',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'DOT': 'polkadot',
  'DAI': 'dai',
  'SHIB': 'shiba-inu',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'UNI': 'uniswap',
  'ATOM': 'cosmos',
  'ETC': 'ethereum-classic',
  'XLM': 'stellar',
  'XMR': 'monero',
  'HBAR': 'hedera-hashgraph',
  'ALGO': 'algorand',
  'VET': 'vechain',
  'FIL': 'filecoin',
  'ICP': 'internet-computer',
  'APT': 'aptos',
  'ARB': 'arbitrum',
  'OP': 'optimism',
  'NEAR': 'near',
  'SEI': 'sei-network',
  'TEL': 'telcoin',
}

// Function to get chart data for the last X days using CoinGecko
async function getChartData(symbol: string, days: number) {
  if (!COINGECKO_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
  }

  try {
    const coinId = SYMBOL_TO_ID_MAP[symbol] || symbol.toLowerCase()

    // Use CoinGecko Pro Market Chart endpoint for historical data
    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`,
      {
        headers: {
          'x-cg-pro-api-key': COINGECKO_API_KEY,
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch historical data')
    }

    const data = await response.json()

    // Transform CoinGecko data to price points
    // data.prices is an array of [timestamp, price]
    const prices = data.prices.map((point: [number, number]) => ({
      timestamp: point[0],
      price: point[1]
    }))

    return NextResponse.json({
      symbol,
      prices,
      days,
    })
  } catch (error) {
    console.error('Chart data error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol')?.toUpperCase()
    const date = searchParams.get('date') // Format: YYYY-MM-DD
    const days = searchParams.get('days') // Number of days for chart data

    // If days parameter is provided, return chart data
    if (symbol && days) {
      return getChartData(symbol, parseInt(days))
    }

    if (!symbol || !date) {
      return NextResponse.json(
        { error: 'Symbol and date are required' },
        { status: 400 }
      )
    }

    if (!COINGECKO_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const coinId = SYMBOL_TO_ID_MAP[symbol] || symbol.toLowerCase()

    // Parse date and get timestamps
    const targetDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    targetDate.setHours(0, 0, 0, 0)

    // If date is today or in the future, use current price
    if (targetDate >= today) {
      const currentPriceResponse = await fetch(
        `https://pro-api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        {
          headers: {
            'x-cg-pro-api-key': COINGECKO_API_KEY,
          },
        }
      )

      if (!currentPriceResponse.ok) {
        throw new Error('Failed to fetch current price')
      }

      const currentData = await currentPriceResponse.json()

      if (!currentData[coinId] || !currentData[coinId].usd) {
        return NextResponse.json(
          { error: 'Symbol not found', symbol },
          { status: 404 }
        )
      }

      return NextResponse.json({
        symbol,
        name: symbol,
        price: currentData[coinId].usd,
        date: today.toISOString().split('T')[0],
        currency: 'USD',
        isHistorical: false,
      })
    }

    // For historical data, use CoinGecko history endpoint
    // Convert date to dd-mm-yyyy format required by CoinGecko
    const [year, month, day] = date.split('-')
    const formattedDate = `${day}-${month}-${year}`

    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/coins/${coinId}/history?date=${formattedDate}`,
      {
        headers: {
          'x-cg-pro-api-key': COINGECKO_API_KEY,
        },
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('CoinGecko historical error:', errorData)

      return NextResponse.json(
        {
          error: 'Historical data not available. Please enter price manually.',
          symbol,
          date
        },
        { status: 503 }
      )
    }

    const data = await response.json()

    // Check if we have data
    if (!data.market_data || !data.market_data.current_price || !data.market_data.current_price.usd) {
      return NextResponse.json(
        { error: 'No historical data found for this date', symbol, date },
        { status: 404 }
      )
    }

    return NextResponse.json({
      symbol,
      name: data.name || symbol,
      price: data.market_data.current_price.usd,
      date,
      currency: 'USD',
      isHistorical: true,
      timestamp: data.last_updated,
    })
  } catch (error) {
    console.error('Historical price fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch historical price. Try entering manually.' },
      { status: 500 }
    )
  }
}
