'use client'

import { useState } from 'react'
import { useCurrency } from '@/components/providers/CurrencyProvider'
import Image from 'next/image'
import Link from 'next/link'

type Client = {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  budget: number
  riskLevel: string
  createdAt: Date
  // Stats fields on client directly
  totalInvested: number
  totalCurrentValue: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  totalFees: number
  clientStats: {
    currentValue: number
    totalProfit: number
    totalProfitPercent: number
  } | null
}

type ClientsListProps = {
  clients: Client[]
}

export default function ClientsList({ clients }: ClientsListProps) {
  const { formatAmount } = useCurrency()
  const [privacyMode, setPrivacyMode] = useState(false)

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  const getRiskLevelColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
      case 'high':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
    }
  }

  const getRiskLevelLabel = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'Faible'
      case 'medium':
        return 'Moyen'
      case 'high':
        return 'Élevé'
      default:
        return risk
    }
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white dark:bg-nm-card-dark shadow-md p-12 text-center card">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Aucun client pour le moment
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Commencez par créer votre premier client
        </p>
        <Link href="/admin/clients/create" className="btn-primary inline-block px-6 py-3">
          Créer un client
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-nm-card-dark shadow-md card overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Liste des Clients
        </h3>
        <button
          onClick={() => setPrivacyMode(!privacyMode)}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={privacyMode ? 'Désactiver mode privé' : 'Activer mode privé'}
        >
          {privacyMode ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Mode Privé Activé</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              <span>Mode Normal</span>
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="text-left px-6 py-4 font-semibold">Client</th>
              <th className="text-left px-6 py-4 font-semibold">Budget Initial</th>
              <th className="text-left px-6 py-4 font-semibold">Valeur Actuelle</th>
              <th className="text-left px-6 py-4 font-semibold">Profit/Perte</th>
              <th className="text-left px-6 py-4 font-semibold">Riesgo</th>
              <th className="text-left px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              // Use stats from client directly (not clientStats table)
              const currentValue = client.totalCurrentValue || client.budget
              const profit = client.totalProfitLoss || 0
              const profitPercent = client.totalProfitLossPercent || 0

              return (
                <tr
                  key={client.id}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {privacyMode ? (
                        <div className="w-10 h-10 bg-gray-400 dark:bg-gray-600 flex items-center justify-center font-semibold flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      ) : client.avatar ? (
                        <div className="relative w-10 h-10 flex-shrink-0">
                          <Image
                            src={client.avatar}
                            alt={`${client.firstName} ${client.lastName}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-nm-accent text-nm-text-secondary flex items-center justify-center font-semibold flex-shrink-0">
                          {getInitials(client.firstName, client.lastName)}
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {privacyMode ? '•••••• ••••••' : `${client.firstName} ${client.lastName}`}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {privacyMode ? '••••••@••••••.com' : client.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 number-format font-medium text-gray-900 dark:text-gray-100">
                    {privacyMode ? '••••••' : formatAmount(client.budget)}
                  </td>
                  <td className="px-6 py-4 number-format font-medium text-gray-900 dark:text-gray-100">
                    {privacyMode ? '••••••' : formatAmount(currentValue)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="number-format">
                      <div
                        className={`font-semibold ${
                          profit >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {privacyMode ? '••••••' : `${profit >= 0 ? '+' : ''}${formatAmount(profit)}`}
                      </div>
                      <div
                        className={`text-sm ${
                          profitPercent >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {privacyMode ? '••••' : `${profitPercent >= 0 ? '+' : ''}${profitPercent.toFixed(2)}%`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getRiskLevelColor(client.riskLevel)}`}>
                      {privacyMode ? '••••' : getRiskLevelLabel(client.riskLevel)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="btn-secondary px-4 py-2 text-sm inline-block"
                    >
                      Voir détails
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
