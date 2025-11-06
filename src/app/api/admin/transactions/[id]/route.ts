import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const transactionId = params.id
    const body = await req.json()

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
      transactionDate,
      transactionTime,
    } = body

    // Get the transaction to get clientId
    const existingTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { clientId: true }
    })

    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 })
    }

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

    // Combine date and time for createdAt
    let createdAt = new Date()
    if (transactionDate && transactionTime) {
      createdAt = new Date(`${transactionDate}T${transactionTime}`)
    } else if (transactionDate) {
      createdAt = new Date(transactionDate)
    }

    // Update transaction
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
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
        createdAt,
      },
    })

    // Recalculate client stats
    const clientId = existingTransaction.clientId

    // Get all transactions for this client
    const transactions = await prisma.transaction.findMany({
      where: { clientId }
    })

    // Calculate new stats (EXCLUDING transfers)
    let totalInvested = 0
    let totalCurrentValue = 0
    let totalProfitLoss = 0
    let totalFees = 0

    for (const tx of transactions) {
      // Skip transfers in stats calculations
      const isTxTransfer = tx.type === 'transfer_in' || tx.type === 'transfer_out'

      if (!isTxTransfer) {
        totalInvested += tx.totalCost
        totalFees += tx.fees
        totalProfitLoss += tx.profitLoss

        if (tx.currentPrice) {
          totalCurrentValue += tx.amount * tx.currentPrice
        } else {
          totalCurrentValue += tx.totalCost
        }
      }
    }

    const totalProfitLossPercent = totalInvested > 0
      ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
      : 0

    // Update client with new stats
    await prisma.client.update({
      where: { id: clientId },
      data: {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercent,
        totalFees
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const transactionId = params.id

    // Get transaction before deleting to get clientId for stats recalculation
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      select: { clientId: true }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 })
    }

    // Delete the transaction
    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    // Recalculate client stats
    const clientId = transaction.clientId

    // Get all remaining transactions for this client
    const transactions = await prisma.transaction.findMany({
      where: { clientId }
    })

    // Calculate new stats (EXCLUDING transfers)
    let totalInvested = 0
    let totalCurrentValue = 0
    let totalProfitLoss = 0
    let totalFees = 0

    for (const tx of transactions) {
      // Skip transfers in stats calculations
      const isTxTransfer = tx.type === 'transfer_in' || tx.type === 'transfer_out'

      if (!isTxTransfer) {
        totalInvested += tx.totalCost
        totalFees += tx.fees
        totalProfitLoss += tx.profitLoss

        if (tx.currentPrice) {
          totalCurrentValue += tx.amount * tx.currentPrice
        } else {
          totalCurrentValue += tx.totalCost
        }
      }
    }

    const totalProfitLossPercent = totalInvested > 0
      ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
      : 0

    // Update client with new stats
    await prisma.client.update({
      where: { id: clientId },
      data: {
        totalInvested,
        totalCurrentValue,
        totalProfitLoss,
        totalProfitLossPercent,
        totalFees
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete transaction error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}
