'use client'

import { useMemo } from 'react'
import { useCurrency } from '@/components/providers/CurrencyProvider'

type Transaction = {
  id: string
  type: string
  totalCost: number
  fees: number
  profitLoss: number
  createdAt: Date
}

export default function ClientChart({
  clientId,
  transactions,
}: {
  clientId: string
  transactions: Transaction[]
}) {
  const { formatAmount } = useCurrency()

  const stats = useMemo(() => {
    const totalInvested = transactions
      .filter((tx) => tx.type === 'buy')
      .reduce((sum, tx) => sum + tx.totalCost + tx.fees, 0)

    const totalProfit = transactions.reduce((sum, tx) => sum + tx.profitLoss, 0)

    const buyCount = transactions.filter((tx) => tx.type === 'buy').length
    const sellCount = transactions.filter((tx) => tx.type === 'sell').length

    return { totalInvested, totalProfit, buyCount, sellCount }
  }, [transactions])

  return (
    <div className="bg-white dark:bg-nm-card-dark shadow-md p-6 card space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-nm-text-secondary dark:text-nm-text-primary">
          Statistiques
        </h3>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total investi</p>
            <p className="text-xl font-bold number-format text-nm-text-secondary dark:text-nm-text-primary">
              {formatAmount(stats.totalInvested)}
            </p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profit total</p>
            <p
              className={`text-xl font-bold number-format ${
                stats.totalProfit >= 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {stats.totalProfit >= 0 ? '+' : ''}
              {formatAmount(stats.totalProfit)}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Achats</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.buyCount}
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Ventes</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.sellCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-500 text-center">
          Les graphiques détaillés seront disponibles prochainement
        </p>
      </div>
    </div>
  )
}
