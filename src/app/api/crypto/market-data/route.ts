import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY

export async function GET() {
  try {
    if (!COINGECKO_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Get top 1000 cryptocurrencies from CoinGecko Pro (optimized to reduce API usage)
    const allCryptos: any[] = []

    // Fetch 4 pages of 250 coins each = 1000 total (reduces API usage by 50%)
    for (let page = 1; page <= 4; page++) {
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=${page}&sparkline=false&price_change_percentage=24h%2C7d`,
        {
          headers: {
            'x-cg-pro-api-key': COINGECKO_API_KEY,
          },
          next: { revalidate: 300 }, // Cache for 5 minutes instead of 1 (reduces API calls)
        }
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('CoinGecko error:', errorData)
        return NextResponse.json(
          { error: 'Failed to fetch data from CoinGecko' },
          { status: response.status }
        )
      }

      const pageData = await response.json()
      allCryptos.push(...pageData)
    }

    const data = allCryptos

    // Transform CoinGecko data to match our structure
    const cryptos = data.map((coin: any) => ({
      id: coin.market_cap_rank || 0,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      image: coin.image,
      quote: {
        USD: {
          price: coin.current_price || 0,
          percent_change_24h: coin.price_change_percentage_24h || 0,
          percent_change_7d: coin.price_change_percentage_7d_in_currency || 0,
          market_cap: coin.market_cap || 0,
          volume_24h: coin.total_volume || 0,
        }
      }
    }))

    return NextResponse.json({
      cryptos: cryptos,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Market data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
