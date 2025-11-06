'use client'

import { useState } from 'react'
import { useCurrency } from '@/components/providers/CurrencyProvider'

type Client = {
  budget: number
  riskLevel: string
  totalInvested: number
  totalCurrentValue: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  commissionPercent: number
}

export default function ClientStatsCards({ client }: { client: Client }) {
  const { formatAmount } = useCurrency()
  const [hideBalances, setHideBalances] = useState(false)

  // Use stats from client directly (same logic as admin panel)
  // Use ?? instead of || to avoid treating 0 as falsy
  const profit = client.totalProfitLoss ?? 0
  const profitPercent = client.totalProfitLossPercent ?? 0
  const invested = client.totalInvested ?? 0
  // If there are transactions (totalInvested > 0), show actual current value
  // Otherwise show budget (when no transactions exist)
  const currentValue = invested > 0 ? (client.totalCurrentValue ?? 0) : client.budget

  const cards = [
    {
      title: 'Budget Total',
      value: formatAmount(client.budget),
      info: 'Montant total alloué à votre portefeuille',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Montant Investi',
      value: formatAmount(invested),
      info: 'Somme totale investie dans vos actifs crypto',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Valeur Actuelle',
      value: formatAmount(currentValue),
      info: 'Valeur actuelle de votre portefeuille aux prix du marché',
      isCurrentValue: true,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
          />
        </svg>
      ),
    },
    {
      title: 'Somme Disponible',
      value: formatAmount(client.budget - invested),
      info: 'Montant disponible pour de nouveaux investissements',
      isAvailable: true,
      availableValue: client.budget - invested,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: 'Profit/Perte',
      value: `${profit >= 0 ? '+' : ''}${formatAmount(profit)}`,
      info: 'Gain ou perte total par rapport à vos investissements',
      isProfit: true,
      profitValue: profit,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
    },
    {
      title: 'Performance',
      value: `${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}%`,
      info: 'Pourcentage de rendement de votre portefeuille',
      isProfit: true,
      profitValue: profitPercent,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: 'Commission de gestion',
      value: `${client.commissionPercent}%`,
      info: 'Taux de commission appliqué sur vos bénéfices',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setHideBalances(!hideBalances)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-nm-card-dark border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          title={hideBalances ? 'Afficher les soldes' : 'Masquer les soldes'}
        >
          {hideBalances ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          )}
          <span>{hideBalances ? 'Afficher' : 'Masquer'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-nm-card-dark shadow-md p-6 hover:shadow-lg transition-shadow card"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-nm-header dark:text-nm-accent">{card.icon}</div>
              <div className="group relative">
                <div className="w-5 h-5 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 cursor-help">
                  i
                </div>
                <div className="absolute right-0 top-6 w-48 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                  {card.info}
                  <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 dark:bg-gray-700 transform rotate-45"></div>
                </div>
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              {card.title}
            </h3>
            <p
              className={`text-2xl font-bold number-format ${
                card.isProfit
                  ? card.profitValue! >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                  : card.isAvailable
                  ? card.availableValue! > 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                  : 'text-nm-text-secondary dark:text-nm-text-primary'
              }`}
            >
              {hideBalances ? '••••••' : card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
