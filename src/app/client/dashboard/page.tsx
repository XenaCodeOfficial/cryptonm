import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import ClientStatsCards from '@/components/client/ClientStatsCards'
import ClientTransactionsView from '@/components/client/ClientTransactionsView'
import CryptoMarketWidget from '@/components/shared/CryptoMarketWidget'
import FloatingChatbot from '@/components/client/FloatingChatbot'
import AutoRefreshPrices from '@/components/client/AutoRefreshPrices'

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'client') {
    redirect('/login')
  }

  const client = await prisma.client.findUnique({
    where: { id: session.user.id },
    include: {
      clientStats: true,
      transactions: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
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

      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-nm-text-secondary dark:text-nm-text-primary">
            Mon Portefeuille
          </h1>
          <AutoRefreshPrices />
        </div>

        <ClientStatsCards client={client} />

        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-nm-text-secondary dark:text-nm-text-primary mb-4 sm:mb-6">
            Mes Transactions
          </h2>
          <ClientTransactionsView transactions={client.transactions} />
        </div>

        <div className="mt-6 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-nm-text-secondary dark:text-nm-text-primary mb-4 sm:mb-6">
            Marchés Crypto
          </h2>
          <CryptoMarketWidget />
        </div>
      </main>

      <FloatingChatbot />
    </div>
  )
}
