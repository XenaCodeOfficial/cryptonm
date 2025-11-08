import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { convertToUSD } from '@/lib/currency'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ id: string }>
}

// PUT - Update client
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()

    const {
      firstName,
      lastName,
      age,
      gender,
      nationality,
      riskLevel,
      budget,
      budgetCurrency,
      commissionPercent,
      avatar,
      cardColor,
      cardDesign,
      cardGradient,
    } = body

    // Convert budget to USD if currency provided
    let budgetInUSD = budget
    if (budgetCurrency && budget) {
      budgetInUSD = await convertToUSD(parseFloat(budget), budgetCurrency)
      console.log(`Budget update conversion: ${budget} ${budgetCurrency} = ${budgetInUSD} USD`)
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        firstName,
        lastName,
        age,
        gender,
        nationality,
        riskLevel,
        budget: budgetInUSD,
        budgetCurrency,
        commissionPercent,
        avatar,
        cardColor,
        cardDesign,
        cardGradient,
      },
    })

    return NextResponse.json({ success: true, client })
  } catch (error: any) {
    console.error('Update client error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Delete client
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    await prisma.client.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete client error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
