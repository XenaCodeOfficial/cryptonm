'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ClientCard from '@/components/common/ClientCard'

type EditClientFormProps = {
  client: {
    id: string
    firstName: string
    lastName: string
    email: string
    age: number | null
    gender: string | null
    nationality: string | null
    riskLevel: string
    budget: number
    budgetCurrency: string
    commissionPercent: number
    avatar: string | null
    cardColor: string
    cardDesign: string
    cardGradient: string | null
    totalCurrentValue: number
  }
}

export default function EditClientForm({ client }: EditClientFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [formData, setFormData] = useState({
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    email: client.email || '',
    age: client.age?.toString() || '',
    gender: client.gender || '',
    nationality: client.nationality || '',
    riskLevel: client.riskLevel || 'medium',
    budget: client.budget.toString() || '',
    budgetCurrency: client.budgetCurrency || 'USD',
    commissionPercent: client.commissionPercent.toString() || '0',
    avatar: client.avatar || '',
    cardColor: client.cardColor || '#1a1a2e',
    cardDesign: client.cardDesign || 'gradient',
    cardGradient: client.cardGradient || '#16213e',
  })

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const formDataUpload = new FormData()
    formDataUpload.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) throw new Error('Upload failed')

      const data = await response.json()
      setFormData((prev) => ({ ...prev, avatar: data.url }))
    } catch (err) {
      setError('Erreur lors du téléchargement de l\'avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          budget: parseFloat(formData.budget),
          commissionPercent: parseFloat(formData.commissionPercent || '0'),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      setSuccess('Client mis à jour avec succès')
      setTimeout(() => {
        router.push(`/admin/clients/${client.id}`)
      }, 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-nm-header dark:text-nm-text-primary hover:underline mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour
        </button>
        <h1 className="text-3xl font-bold text-nm-text-secondary dark:text-nm-text-primary">
          Modifier le Client
        </h1>
      </div>

      <div className="bg-white dark:bg-nm-card-dark shadow-md p-8 card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informations personnelles</h3>

            {/* Avatar */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Photo de profil</label>
              {formData.avatar && (
                <img
                  src={formData.avatar}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="w-full"
              />
              {uploadingAvatar && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Téléchargement...</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Prénom *</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                className="w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
                disabled
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                L'email ne peut pas être modifié
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium mb-2">Âge</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="w-full"
                  min="18"
                  max="120"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Sexe</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full"
                >
                  <option value="">Sélectionner</option>
                  <option value="male">Homme</option>
                  <option value="female">Femme</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nationalité</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full"
                  placeholder="Ex: Française"
                />
              </div>
            </div>
          </div>

          {/* Investment Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Informations d'investissement</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Budget initial *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="flex-1"
                    required
                    min="0"
                    step="0.01"
                    placeholder="Montant"
                  />
                  <select
                    value={formData.budgetCurrency}
                    onChange={(e) => setFormData({ ...formData, budgetCurrency: e.target.value })}
                    className="w-24"
                    required
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="CHF">CHF</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Niveau de risque *</label>
                <select
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value })}
                  className="w-full"
                  required
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyen</option>
                  <option value="high">Élevé</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Pourcentage de commission (%)</label>
              <input
                type="number"
                value={formData.commissionPercent}
                onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
                className="w-full"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          {/* Card Customization */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-semibold mb-4">Personnalisation de la carte client</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Style de carte</label>
                <select
                  value={formData.cardDesign}
                  onChange={(e) => setFormData({ ...formData, cardDesign: e.target.value })}
                  className="w-full"
                >
                  <option value="gradient">Dégradé</option>
                  <option value="solid">Uni</option>
                  <option value="pattern">Motif</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Couleur principale</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.cardColor}
                    onChange={(e) => setFormData({ ...formData, cardColor: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.cardColor}
                    onChange={(e) => setFormData({ ...formData, cardColor: e.target.value })}
                    className="flex-1"
                    placeholder="#1a1a2e"
                  />
                </div>
              </div>
            </div>

            {formData.cardDesign === 'gradient' && (
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">Couleur secondaire (dégradé)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.cardGradient}
                    onChange={(e) => setFormData({ ...formData, cardGradient: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.cardGradient}
                    onChange={(e) => setFormData({ ...formData, cardGradient: e.target.value })}
                    className="flex-1"
                    placeholder="#16213e"
                  />
                </div>
              </div>
            )}

            {/* Card Preview */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">Aperçu de la carte</label>
              <ClientCard
                client={{
                  firstName: formData.firstName || 'Prénom',
                  lastName: formData.lastName || 'Nom',
                  cardColor: formData.cardColor,
                  cardDesign: formData.cardDesign,
                  cardGradient: formData.cardGradient,
                  totalCurrentValue: client.totalCurrentValue,
                  budgetCurrency: formData.budgetCurrency,
                }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3">
              {success}
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
