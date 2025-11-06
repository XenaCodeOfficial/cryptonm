import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import ClientDetailHeader from '@/components/admin/ClientDetailHeader'
import ClientTransactions from '@/components/admin/ClientTransactions'
import ClientChart from '@/components/admin/ClientChart'
import AddTransactionButton from '@/components/admin/AddTransactionButton'
import ManageBudgetButton from '@/components/admin/ManageBudgetButton'
import CryptoMarketWidget from '@/components/shared/CryptoMarketWidget'
import AutoRefreshPrices from '@/components/admin/AutoRefreshPrices'

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string }
}) {
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
    where: { id: params.id },
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
    redirect('/admin/dashboard')
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

      <main className="max-w-[1920px] mx-auto px-6 py-8">
        <ClientDetailHeader client={client} />

        <div className="flex justify-end mt-4 mb-2">
          <AutoRefreshPrices clientId={client.id} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-nm-text-secondary dark:text-nm-text-primary">
                Transactions
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <ManageBudgetButton clientId={client.id} currentBudget={client.budget} />
                <AddTransactionButton clientId={client.id} />
              </div>
            </div>
            <ClientTransactions transactions={client.transactions} clientId={client.id} />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-nm-text-secondary dark:text-nm-text-primary mb-6">
              Performance
            </h2>
            <ClientChart clientId={client.id} transactions={client.transactions} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl sm:text-2xl font-bold text-nm-text-secondary dark:text-nm-text-primary mb-6">
            Marchés Crypto
          </h2>
          <CryptoMarketWidget />
        </div>
      </main>
    </div>
  )
}
