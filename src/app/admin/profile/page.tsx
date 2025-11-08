import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import AdminProfileClient from '@/components/admin/AdminProfileClient'

export default async function AdminProfilePage() {
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

  return (
    <div className="min-h-screen">
      <HeaderWrapper
        user={{
          name: admin.name,
          email: admin.email,
          avatar: admin.avatar,
        }}
        role="admin"
      />
      <AdminProfileClient admin={admin} />
    </div>
  )
}
