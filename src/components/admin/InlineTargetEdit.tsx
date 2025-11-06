'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/components/providers/CurrencyProvider'

type Props = {
  transactionId: string
  currentTarget: number | null
  currentTargetMax: number | null
  onClose: () => void
}

export default function InlineTargetEdit({ transactionId, currentTarget, currentTargetMax, onClose }: Props) {
  const [targetPrice, setTargetPrice] = useState(currentTarget?.toString() || '')
  const [targetPriceMax, setTargetPriceMax] = useState(currentTargetMax?.toString() || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { currency } = useCurrency()

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetPrice: targetPrice ? parseFloat(targetPrice) : null,
          targetPriceMax: targetPriceMax ? parseFloat(targetPriceMax) : null,
        }),
      })

      if (!response.ok) throw new Error('Update failed')

      router.refresh()
      onClose()
    } catch (error) {
      console.error('Error updating target:', error)
      alert('Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-400 dark:border-blue-500 p-4 rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-bold mb-3 text-blue-800 dark:text-blue-200">
          Modifier le Target
        </h3>

        <div className="space-y-2">
          <div>
            <label className="text-xs text-blue-700 dark:text-blue-300">
              Target Min ({currency})
            </label>
            <input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 1.00"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-blue-700 dark:text-blue-300">
              Target Max ({currency}) - Optionnel
            </label>
            <input
              type="number"
              step="0.01"
              value={targetPriceMax}
              onChange={(e) => setTargetPriceMax(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-600 bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 3.00"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-3 py-1.5 text-xs border border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-3 py-1.5 text-xs bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
