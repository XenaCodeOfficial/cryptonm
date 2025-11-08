import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
      include: {
        transactions: {
          where: {
            type: {
              in: ['buy', 'transfer_in'],
            },
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Group transactions by asset and calculate current values
    const assetMap = new Map<string, { amount: number; value: number }>()

    for (const tx of client.transactions) {
      const existing = assetMap.get(tx.asset) || { amount: 0, value: 0 }

      // Add the amount of crypto
      existing.amount += tx.amount

      // Calculate current value (amount * current price)
      const currentPrice = tx.currentPrice || tx.pricePerUnit
      existing.value += tx.amount * currentPrice

      assetMap.set(tx.asset, existing)
    }

    // Calculate total portfolio value
    let totalValue = 0
    for (const data of assetMap.values()) {
      totalValue += data.value
    }

    // Build allocations array with percentages
    const allocations = Array.from(assetMap.entries())
      .map(([asset, data]) => ({
        asset,
        value: data.value,
        percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      }))
      .sort((a, b) => b.value - a.value) // Sort by value descending

    return NextResponse.json({ allocations, totalValue })
  } catch (error: any) {
    console.error('Get portfolio allocation error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
