import { NextRequest, NextResponse } from 'next/server'

const COINGECKO_API_KEY = process.env.COINGECKO_API_KEY

// Fallback list of popular cryptos for when API is unavailable
const POPULAR_CRYPTOS = [
  { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin', rank: 1 },
  { symbol: 'ETH', name: 'Ethereum', id: 'ethereum', rank: 2 },
  { symbol: 'USDT', name: 'Tether', id: 'tether', rank: 3 },
  { symbol: 'BNB', name: 'BNB', id: 'binance-coin', rank: 4 },
  { symbol: 'SOL', name: 'Solana', id: 'solana', rank: 5 },
  { symbol: 'USDC', name: 'USD Coin', id: 'usd-coin', rank: 6 },
  { symbol: 'XRP', name: 'XRP', id: 'xrp', rank: 7 },
  { symbol: 'ADA', name: 'Cardano', id: 'cardano', rank: 8 },
  { symbol: 'AVAX', name: 'Avalanche', id: 'avalanche', rank: 9 },
  { symbol: 'DOGE', name: 'Dogecoin', id: 'dogecoin', rank: 10 },
  { symbol: 'TRX', name: 'TRON', id: 'tron', rank: 11 },
  { symbol: 'DOT', name: 'Polkadot', id: 'polkadot', rank: 12 },
  { symbol: 'MATIC', name: 'Polygon', id: 'polygon', rank: 13 },
  { symbol: 'LINK', name: 'Chainlink', id: 'chainlink', rank: 14 },
  { symbol: 'SHIB', name: 'Shiba Inu', id: 'shiba-inu', rank: 15 },
  { symbol: 'TEL', name: 'Telcoin', id: 'telcoin', rank: 150 },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')

    if (!query || query.length < 2) {
      return NextResponse.json({ assets: [] })
    }

    const queryUpper = query.toUpperCase()

    try {
      // Try CoinGecko Pro API first (more reliable)
      const response = await fetch(
        `https://pro-api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'x-cg-pro-api-key': COINGECKO_API_KEY || '',
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(3000), // 3 second timeout
        }
      )

      if (response.ok) {
        const data = await response.json()

        // Format CoinGecko results
        const assets = data.coins?.slice(0, 10).map((coin: any, index: number) => ({
          symbol: coin.symbol?.toUpperCase() || '',
          name: coin.name || '',
          id: coin.id || '',
          rank: coin.market_cap_rank || index + 1,
        })) || []

        if (assets.length > 0) {
          return NextResponse.json({ assets })
        }
      }
    } catch (apiError) {
      console.log('CoinGecko API unavailable, using fallback')
    }

    // Fallback to local search if API fails
    const fallbackResults = POPULAR_CRYPTOS.filter(
      (crypto) =>
        crypto.symbol.includes(queryUpper) ||
        crypto.name.toUpperCase().includes(queryUpper)
    ).slice(0, 10)

    return NextResponse.json({ assets: fallbackResults })
  } catch (error) {
    console.error('Asset search error:', error)

    // Return empty array as last resort
    return NextResponse.json({ assets: [] })
  }
}
