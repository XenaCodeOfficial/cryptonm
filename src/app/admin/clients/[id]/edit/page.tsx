import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import EditClientForm from '@/components/admin/EditClientForm'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditClientPage({ params }: PageProps) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  const admin = await prisma.admin.findUnique({
    where: { id: session.user.id },
  })

  if (!admin) {
    redirect('/login')
  }

  const client = await prisma.client.findUnique({
    where: { id },
  })

  if (!client) {
    redirect('/admin/dashboard')
  }

  return (
    <div className="min-h-screen">
      <HeaderWrapper
        user={{
          id: admin.id,
          name: admin.name,
          email: admin.email,
          avatar: admin.avatar,
        }}
        role="admin"
      />
      <EditClientForm client={client} />
    </div>
  )
}
