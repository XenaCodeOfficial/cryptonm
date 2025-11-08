import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'client') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    const client = await prisma.client.findUnique({
      where: { email: session.user.email },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'Date',
        'Type',
        'Category',
        'Asset',
        'Platform',
        'Amount',
        'Price Per Unit',
        'Total Cost',
        'Fees',
        'Current Price',
        'Profit/Loss',
        'Profit/Loss %',
        'Target Price',
        'Notes',
      ]

      const rows = client.transactions.map((tx) => [
        new Date(tx.createdAt).toLocaleDateString('en-US'),
        tx.type,
        tx.category,
        tx.asset,
        tx.platform,
        tx.amount.toString(),
        tx.pricePerUnit.toString(),
        tx.totalCost.toString(),
        tx.fees.toString(),
        tx.currentPrice?.toString() || '',
        tx.profitLoss.toString(),
        tx.profitLossPercent.toString(),
        tx.targetPrice?.toString() || '',
        tx.notes || '',
      ])

      const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="transactions-${client.firstName}-${client.lastName}-${Date.now()}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: 'Unsupported format' }, { status: 400 })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
