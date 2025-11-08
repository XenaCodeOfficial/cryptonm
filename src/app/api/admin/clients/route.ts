import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { convertToUSD } from '@/lib/currency'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const {
      firstName,
      lastName,
      email,
      age,
      gender,
      nationality,
      riskLevel,
      budget,
      budgetCurrency,
      commissionPercent,
      avatar,
      magicLink,
      cardColor,
      cardDesign,
      cardGradient,
    } = body

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email },
    })

    if (existingClient) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Convert budget to USD if needed
    const currency = budgetCurrency || 'USD'
    const budgetInUSD = await convertToUSD(parseFloat(budget), currency)

    console.log(`Budget conversion: ${budget} ${currency} = ${budgetInUSD} USD`)

    // Create client without password (will use magic link)
    // Magic link expires in 48 hours
    const magicLinkExpiresAt = new Date()
    magicLinkExpiresAt.setHours(magicLinkExpiresAt.getHours() + 48)

    const client = await prisma.client.create({
      data: {
        firstName,
        lastName,
        email,
        password: null,
        age,
        gender,
        nationality,
        riskLevel,
        budget: budgetInUSD, // Always store in USD
        budgetCurrency: currency, // Store original currency
        commissionPercent: commissionPercent || 0,
        avatar,
        magicLink,
        magicLinkExpiresAt,
        cardColor: cardColor || '#1a1a2e',
        cardDesign: cardDesign || 'gradient',
        cardGradient: cardGradient || '#16213e',
        // Initialize stats fields
        totalInvested: budgetInUSD,
        totalCurrentValue: budgetInUSD,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        totalFees: 0,
      },
    })

    // Create initial client stats
    await prisma.clientStats.create({
      data: {
        clientId: client.id,
        totalInvested: budgetInUSD,
        currentValue: budgetInUSD,
        totalProfit: 0,
        totalProfitPercent: 0,
      },
    })

    return NextResponse.json({ success: true, client })
  } catch (error: any) {
    console.error('Create client error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
