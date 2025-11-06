import { NextRequest, NextResponse } from 'next/server'

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const symbol = searchParams.get('symbol')?.toUpperCase()

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    if (!COINGECKO_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Convert symbol to CoinGecko ID
    const coinId = SYMBOL_TO_ID_MAP[symbol] || symbol.toLowerCase()

    // Call CoinGecko Pro API v3 - Simple Price endpoint
    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_last_updated_at=true`,
      {
        headers: {
          'x-cg-pro-api-key': COINGECKO_API_KEY,
        },
        next: { revalidate: 60 }, // Cache for 60 seconds
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('CoinGecko error:', errorData)
      return NextResponse.json(
        { error: 'Failed to fetch price from CoinGecko' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Check if coin data exists
    if (!data[coinId] || !data[coinId].usd) {
      return NextResponse.json(
        { error: 'Symbol not found', symbol },
        { status: 404 }
      )
    }

    const coinData = data[coinId]

    return NextResponse.json({
      symbol: symbol,
      name: symbol,
      price: coinData.usd,
      currency: 'USD',
      lastUpdated: coinData.last_updated_at ? new Date(coinData.last_updated_at * 1000).toISOString() : new Date().toISOString(),
    })
  } catch (error) {
    console.error('Price fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
