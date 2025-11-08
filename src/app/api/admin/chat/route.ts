import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET - Get all chat messages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use a single transaction to get both messages and count
    const [messages, unreadCount] = await prisma.$transaction([
      prisma.chatMessage.findMany({
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        take: 100, // Last 100 messages
      }),
      prisma.chatMessage.count({
        where: {
          isRead: false,
        },
      }),
    ])

    return NextResponse.json({ messages, unreadCount })
  } catch (error: any) {
    console.error('Error fetching chat messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
    }

    const admin = await prisma.admin.findUnique({
      where: { email: session.user.email },
    })

    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        adminId: admin.id,
        message: message.trim(),
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(chatMessage)
  } catch (error: any) {
    console.error('Error creating chat message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
