import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, password } = body

    if (!clientId || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Update client
    await prisma.client.update({
      where: { id: clientId },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Set password error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
