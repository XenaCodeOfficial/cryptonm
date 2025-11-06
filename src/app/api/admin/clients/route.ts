import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
      commissionPercent,
      avatar,
      magicLink,
    } = body

    // Check if email already exists
    const existingClient = await prisma.client.findUnique({
      where: { email },
    })

    if (existingClient) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Create client without password (will use magic link)
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
        budget,
        commissionPercent: commissionPercent || 0,
        avatar,
        magicLink,
      },
    })

    // Create initial client stats
    await prisma.clientStats.create({
      data: {
        clientId: client.id,
        totalInvested: budget,
        currentValue: budget,
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
