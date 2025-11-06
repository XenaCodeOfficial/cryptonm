import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { additionalAmount } = await request.json()

    if (additionalAmount === undefined || additionalAmount === null || additionalAmount === 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    // Get current client budget
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      select: { budget: true },
    })

    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    // Update budget by adding the additional amount
    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        budget: client.budget + additionalAmount,
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('Budget update error:', error)
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}
