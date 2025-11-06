import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const clientId = params.id

    const {
      type,
      category,
      customCategory,
      asset,
      platform,
      amount,
      pricePerUnit,
      totalCost,
      fees,
      feesCurrency,
      transferFrom,
      transferTo,
      transferAddress,
      targetPrice,
      targetPriceMax,
      currentPrice,
      isPresale,
      presaleEndDate,
      presaleTarget,
      notes,
    } = body

    // Calculate profit/loss if currentPrice is provided (but NOT for transfers)
    let profitLoss = 0
    let profitLossPercent = 0
    const isTransfer = type === 'transfer_in' || type === 'transfer_out'

    if (currentPrice && type === 'buy' && !isTransfer) {
      const currentValue = amount * currentPrice
      const costWithFees = totalCost + fees
      profitLoss = currentValue - costWithFees
      profitLossPercent = (profitLoss / costWithFees) * 100
    }

    const feesPercent = fees > 0 && totalCost > 0 ? (fees / totalCost) * 100 : 0

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        clientId,
        type,
        category,
        customCategory,
        asset,
        platform,
        amount,
        pricePerUnit,
        totalCost,
        fees,
        feesPercent,
        feesCurrency,
        transferFrom,
        transferTo,
        transferAddress,
        targetPrice,
        targetPriceMax,
        currentPrice,
        profitLoss,
        profitLossPercent,
        isPresale,
        presaleEndDate: presaleEndDate ? new Date(presaleEndDate) : null,
        presaleTarget,
        notes,
      },
    })

    // Update client stats
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        transactions: true,
        clientStats: true,
      },
    })

    if (client) {
      // Calculate new stats (EXCLUDING transfers)
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

      // Calculate total fees
      const totalFees = client.transactions
        .filter((tx) => tx.type === 'buy' || tx.type === 'sell')
        .reduce((sum, tx) => sum + tx.fees, 0)

      // Update Client model with stats
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

      // Update or create client stats
      if (client.clientStats) {
        await prisma.clientStats.update({
          where: { id: client.clientStats.id },
          data: {
            totalInvested,
            currentValue,
            totalProfit,
            totalProfitPercent,
            lastCalculated: new Date(),
          },
        })
      } else {
        await prisma.clientStats.create({
          data: {
            clientId,
            totalInvested,
            currentValue,
            totalProfit,
            totalProfitPercent,
          },
        })
      }
    }

    return NextResponse.json({ success: true, transaction })
  } catch (error: any) {
    console.error('Create transaction error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
