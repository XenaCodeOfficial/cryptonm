import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    const client = await prisma.client.findUnique({
      where: { id: params.id },
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
        'Fees %',
        'Fee Currency',
        'Current Price',
        'Profit/Loss',
        'Profit/Loss %',
        'Target Price Min',
        'Target Price Max',
        'Transfer From',
        'Transfer To',
        'Transfer Address',
        'Presale',
        'Presale End Date',
        'Presale Target',
        'Notes',
        'Created At',
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
        tx.feesPercent.toString(),
        tx.feesCurrency || '',
        tx.currentPrice?.toString() || '',
        tx.profitLoss.toString(),
        tx.profitLossPercent.toString(),
        tx.targetPrice?.toString() || '',
        tx.targetPriceMax?.toString() || '',
        tx.transferFrom || '',
        tx.transferTo || '',
        tx.transferAddress || '',
        tx.isPresale ? 'Yes' : 'No',
        tx.presaleEndDate ? new Date(tx.presaleEndDate).toLocaleDateString('en-US') : '',
        tx.presaleTarget?.toString() || '',
        tx.notes || '',
        new Date(tx.createdAt).toISOString(),
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
