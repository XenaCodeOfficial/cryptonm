'use client'

import { useCurrency } from '@/components/providers/CurrencyProvider'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Client = {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar: string | null
  budget: number
  riskLevel: string
  age: number | null
  gender: string | null
  nationality: string | null
  commissionPercent: number
  magicLink: string
  createdAt: Date
  // Stats fields on client directly
  totalInvested: number
  totalCurrentValue: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  totalFees: number
  clientStats: {
    totalInvested: number
    currentValue: number
    totalProfit: number
    totalProfitPercent: number
  } | null
}

export default function ClientDetailHeader({ client }: { client: Client }) {
  const { formatAmount } = useCurrency()
  const router = useRouter()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const getGenderLabel = (gender: string) => {
    const genderMap: Record<string, string> = {
      'male': 'Homme',
      'female': 'Femme',
      'other': 'Autre',
    }
    return genderMap[gender.toLowerCase()] || gender
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Delete failed')

      router.push('/admin/dashboard')
      router.refresh()
    } catch (err) {
      alert('Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  // Use stats from client directly (not clientStats table)
  // Use ?? instead of || to avoid treating 0 as falsy
  const profit = client.totalProfitLoss ?? 0
  const profitPercent = client.totalProfitLossPercent ?? 0
  const invested = client.totalInvested ?? 0
  // If there are transactions (totalInvested > 0), show actual current value
  // Otherwise show budget (when no transactions exist)
  const currentValue = invested > 0 ? (client.totalCurrentValue ?? 0) : client.budget

  return (
    <>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-nm-header dark:text-nm-text-primary hover:underline mb-6"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Retour au tableau de bord
      </button>

      <div className="bg-white dark:bg-nm-card-dark shadow-md p-8 card">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Avatar and Name */}
          <div className="flex items-start gap-4">
            {client.avatar ? (
              <div className="relative w-24 h-24 flex-shrink-0">
                <Image
                  src={client.avatar}
                  alt={`${client.firstName} ${client.lastName}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 bg-nm-accent text-nm-text-secondary flex items-center justify-center font-bold text-2xl flex-shrink-0">
                {getInitials(client.firstName, client.lastName)}
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-nm-text-secondary dark:text-nm-text-primary mb-2">
                {client.firstName} {client.lastName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">{client.email}</p>
              <span className={`badge ${getRiskLevelColor(client.riskLevel)}`}>
                Risque: {client.riskLevel === 'low' ? 'Faible' : client.riskLevel === 'medium' ? 'Moyen' : client.riskLevel === 'high' ? 'Élevé' : client.riskLevel}
              </span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Budget Total</p>
              <p className="text-xl font-bold number-format text-nm-text-secondary dark:text-nm-text-primary">
                {formatAmount(client.budget)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Montant Investi</p>
              <p className="text-xl font-bold number-format text-nm-text-secondary dark:text-nm-text-primary">
                {formatAmount(invested)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Somme Disponible</p>
              <p className={`text-xl font-bold number-format ${
                (client.budget - invested) > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatAmount(client.budget - invested)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Profit/Perte</p>
              <div>
                <p
                  className={`text-xl font-bold number-format ${
                    profit >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {profit >= 0 ? '+' : ''}
                  {formatAmount(profit)}
                </p>
                <p
                  className={`text-sm ${
                    profitPercent >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {profitPercent >= 0 ? '+' : ''}
                  {profitPercent.toFixed(2)}%
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Commission</p>
              <div>
                <p className="text-xl font-bold text-nm-text-secondary dark:text-nm-text-primary">
                  {client.commissionPercent}%
                </p>
                {profit > 0 && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {formatAmount((profit * client.commissionPercent) / 100)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <div className="flex items-start">
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
          {/* Personal Info */}
          {(client.age || client.gender || client.nationality) && (
            <div className="flex gap-6 text-sm">
              {client.age && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Âge:</span>{' '}
                  <span className="font-medium">{client.age} ans</span>
                </div>
              )}
              {client.gender && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Sexe:</span>{' '}
                  <span className="font-medium">{getGenderLabel(client.gender)}</span>
                </div>
              )}
              {client.nationality && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Nationalité:</span>{' '}
                  <span className="font-medium">{client.nationality}</span>
                </div>
              )}
            </div>
          )}

          {/* Magic Link - Simplified */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/magic/${client.magicLink}`)
                alert('Magic link copié dans le presse-papiers!')
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              title="Copier le magic link (accès client)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Magic Link
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-nm-card-dark shadow-2xl max-w-md w-full p-8 card">
            <h3 className="text-xl font-bold mb-4 text-nm-text-secondary dark:text-nm-text-primary">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="flex-1 btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
