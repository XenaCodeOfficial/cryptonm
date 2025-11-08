import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import ClientProfileClient from '@/components/client/ClientProfileClient'

export default async function ClientProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'client') {
    redirect('/login')
  }

  const client = await prisma.client.findUnique({
    where: { id: session.user.id },
  })

  if (!client) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen">
      <HeaderWrapper
        user={{
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          avatar: client.avatar,
        }}
        role="client"
      />
      <ClientProfileClient client={client} />
    </div>
  )
}
