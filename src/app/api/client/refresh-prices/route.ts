import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const clientId = session.user.id

    // Get all buy transactions for this client
    const transactions = await prisma.transaction.findMany({
      where: {
        clientId,
        type: 'buy',
      },
    })

    if (transactions.length === 0) {
      return NextResponse.json({ message: 'No transactions to update' })
    }

    // Get unique symbols and convert to CoinGecko IDs
    const symbols = [...new Set(transactions.map(tx => tx.asset))]
    const coinIds = symbols.map(symbol => SYMBOL_TO_ID_MAP[symbol] || symbol.toLowerCase())

    // Fetch current prices from CoinGecko Pro for all symbols at once
    const response = await fetch(
      `https://pro-api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd`,
      {
        headers: {
          'x-cg-pro-api-key': COINGECKO_API_KEY!,
        },
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch prices from CoinGecko')
    }

    const data = await response.json()

    // Create a map from symbol to price
    const priceMap = new Map<string, number>()
    symbols.forEach(symbol => {
      const coinId = SYMBOL_TO_ID_MAP[symbol] || symbol.toLowerCase()
      if (data[coinId] && data[coinId].usd) {
        priceMap.set(symbol, data[coinId].usd)
      }
    })

    // Update each transaction with current price
    for (const tx of transactions) {
      const currentPrice = priceMap.get(tx.asset)
      if (currentPrice) {
        const currentValue = tx.amount * currentPrice
        const profitLoss = currentValue - tx.totalCost
        const profitLossPercent = (profitLoss / tx.totalCost) * 100

        await prisma.transaction.update({
          where: { id: tx.id },
          data: {
            currentPrice,
            profitLoss,
            profitLossPercent,
          },
        })
      }
    }

    // Recalculate client stats
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        transactions: true,
      },
    })

    if (client) {
      const totalInvested = client.transactions
        .filter((tx) => tx.type === 'buy')
        .reduce((sum, tx) => sum + tx.totalCost + tx.fees, 0)

      const totalReceived = client.transactions
        .filter((tx) => tx.type === 'sell')
        .reduce((sum, tx) => sum + tx.totalCost - tx.fees, 0)

      const totalCurrentValue = client.transactions
        .filter((tx) => tx.type === 'buy')
        .reduce((sum, tx) => {
          if (tx.currentPrice) {
            return sum + tx.amount * tx.currentPrice
          }
          return sum + tx.totalCost
        }, 0)

      const currentValue = totalCurrentValue - totalReceived
      const totalProfit = currentValue - (totalInvested - totalReceived)
      const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0

      const totalFees = client.transactions
        .filter((tx) => tx.type === 'buy' || tx.type === 'sell')
        .reduce((sum, tx) => sum + tx.fees, 0)

      await prisma.client.update({
        where: { id: clientId },
        data: {
          totalInvested,
          totalCurrentValue: currentValue,
          totalProfitLoss: totalProfit,
          totalProfitLossPercent: totalProfitPercent,
          totalFees,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Prices updated successfully',
      updatedTransactions: transactions.length
    })
  } catch (error: any) {
    console.error('Refresh prices error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
