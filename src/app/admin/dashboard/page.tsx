import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import StatsCards from '@/components/admin/StatsCards'
import ClientsList from '@/components/admin/ClientsList'
import Link from 'next/link'

export default async function AdminDashboard() {
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

  // Get all clients
  const clients = await prisma.client.findMany({
    include: {
      clientStats: true,
      transactions: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Calculate global stats using client fields directly (not clientStats table)
  const totalAssetsUnderMgmt = clients.reduce((sum, client) => {
    return sum + (client.totalCurrentValue || client.budget)
  }, 0)

  // Only count invested if client has transactions
  const totalInvested = clients.reduce((sum, client) => {
    return sum + (client.totalInvested || 0)
  }, 0)

  const totalCurrentValue = clients.reduce((sum, client) => {
    return sum + (client.totalCurrentValue || 0)
  }, 0)

  // If no investments yet, show 0% instead of negative
  const globalPerformance = totalInvested > 0
    ? ((totalCurrentValue - totalInvested) / totalInvested) * 100
    : 0

  const avgClientReturn = clients.length > 0
    ? clients.reduce((sum, client) => {
        return sum + (client.totalProfitLossPercent || 0)
      }, 0) / clients.length
    : 0

  const totalCommissions = clients.reduce((sum, client) => {
    const profit = client.totalProfitLoss || 0
    return sum + (profit > 0 ? (profit * client.commissionPercent) / 100 : 0)
  }, 0)

  const activeClients = clients.length

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

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-nm-text-secondary dark:text-nm-text-primary">
            Gestion des Clients
          </h1>
          <Link
            href="/admin/clients/create"
            className="btn-primary px-4 sm:px-6 py-2 sm:py-3 inline-flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Créer un client
          </Link>
        </div>

        <StatsCards
          stats={{
            totalAssetsUnderMgmt,
            globalPerformance,
            avgClientReturn,
            totalCommissions,
            activeClients,
          }}
        />

        <div className="mt-8">
          <ClientsList clients={clients} />
        </div>
      </main>
    </div>
  )
}
