'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/components/providers/CurrencyProvider'

export default function ManageBudgetButton({ clientId, currentBudget }: { clientId: string, currentBudget: number }) {
  const [showModal, setShowModal] = useState(false)
  const [amount, setAmount] = useState('')
  const [operation, setOperation] = useState<'add' | 'subtract'>('add')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { currency, formatAmount } = useCurrency()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) {
      alert('Por favor ingresa un monto válido')
      return
    }

    // Si es restar, verificar que no deje el budget negativo
    if (operation === 'subtract' && value > currentBudget) {
      alert('No puedes restar más del budget actual')
      return
    }

    const additionalAmount = operation === 'add' ? value : -value

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/clients/${clientId}/budget`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          additionalAmount,
        }),
      })

      if (!response.ok) throw new Error('Failed to update budget')

      setShowModal(false)
      setAmount('')
      setOperation('add')
      router.refresh()
    } catch (error) {
      console.error('Error updating budget:', error)
      alert('Error al actualizar el budget')
    } finally {
      setLoading(false)
    }
  }

  const calculateNewBudget = () => {
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) return currentBudget
    return operation === 'add' ? currentBudget + value : currentBudget - value
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-secondary px-4 sm:px-4 py-2 sm:py-3 inline-flex items-center justify-center gap-2 border border-nm-accent hover:bg-nm-accent hover:text-white transition-colors w-full sm:w-auto text-sm sm:text-base"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Gérer le Budget
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-nm-card-dark border border-gray-300 dark:border-gray-600 max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-nm-text-secondary dark:text-nm-text-primary">
                Gérer le Budget
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Budget actuel: <span className="font-semibold text-nm-text-secondary dark:text-nm-text-primary">{formatAmount(currentBudget)}</span>
                </p>

                {/* Toggle Ajouter/Retirer */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-nm-text-secondary dark:text-nm-text-primary">
                    Opération
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOperation('add')}
                      className={`flex-1 px-4 py-2 text-sm font-medium transition-all ${
                        operation === 'add'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      + Ajouter
                    </button>
                    <button
                      type="button"
                      onClick={() => setOperation('subtract')}
                      className={`flex-1 px-4 py-2 text-sm font-medium transition-all ${
                        operation === 'subtract'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                      }`}
                    >
                      - Retirer
                    </button>
                  </div>
                </div>

                <label className="block text-sm font-medium mb-2 text-nm-text-secondary dark:text-nm-text-primary">
                  Montant ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="input w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-nm-text-secondary dark:text-nm-text-primary focus:outline-none focus:ring-2 focus:ring-nm-accent"
                  required
                  autoFocus
                />

                {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Nouveau budget: <span className={`font-semibold ${
                      operation === 'add' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'
                    }`}>
                      {formatAmount(calculateNewBudget())}
                    </span>
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-300 dark:border-gray-600"
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 text-white ${
                    operation === 'add' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  } transition-colors`}
                  disabled={loading}
                >
                  {loading ? 'Enregistrement...' : operation === 'add' ? 'Ajouter' : 'Retirer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
