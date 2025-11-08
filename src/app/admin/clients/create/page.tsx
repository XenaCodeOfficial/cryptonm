'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import { useSession } from 'next-auth/react'
import { nanoid } from 'nanoid'

export default function CreateClientPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    age: '',
    gender: '',
    nationality: '',
    riskLevel: 'medium',
    budget: '',
    commissionPercent: '',
    noCommission: false,
    avatar: '',
    letClientUpload: false,
  })

  const [magicLink, setMagicLink] = useState<string>('')

  const generateMagicLink = () => {
    const link = nanoid(32)
    setMagicLink(link)
    return link
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
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
    setLoading(true)

    const link = magicLink || generateMagicLink()

    try {
      const response = await fetch('/api/admin/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
          budget: parseFloat(formData.budget),
          commissionPercent: formData.noCommission ? 0 : parseFloat(formData.commissionPercent || '0'),
          magicLink: link,
          avatar: formData.letClientUpload ? null : formData.avatar || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  return (
    <div className="min-h-screen">
      <HeaderWrapper
        user={{
          name: session.user.name,
          email: session.user.email,
          avatar: session.user.image,
        }}
        role="admin"
      />

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
            Créer un nouveau client
          </h1>
        </div>

        <div className="bg-white dark:bg-nm-card-dark shadow-md p-8 card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Info */}
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

            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full"
                required
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Le client utilisera le Magic Link pour accéder à son compte
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            {/* Investment Info */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">Informations d'investissement</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Budget initial (USD) *</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full"
                    required
                    min="0"
                    step="0.01"
                  />
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
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={formData.noCommission}
                    onChange={(e) => setFormData({ ...formData, noCommission: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Aucune commission</span>
                </label>

                {!formData.noCommission && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Pourcentage de commission (%)</label>
                    <input
                      type="number"
                      value={formData.commissionPercent}
                      onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
                      className="w-full"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="Ex: 15"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">Photo de profil</h3>

              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.letClientUpload}
                  onChange={(e) => setFormData({ ...formData, letClientUpload: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm font-medium">Laisser le client télécharger sa propre photo</span>
              </label>

              {!formData.letClientUpload && (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    className="w-full"
                  />
                  {uploadingAvatar && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Téléchargement...</p>}
                  {formData.avatar && (
                    <div className="mt-4">
                      <img src={formData.avatar} alt="Avatar" className="w-20 h-20 object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Magic Link */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold mb-4">Magic Link (Accès Client)</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Le client utilisera ce lien pour accéder à son compte et configurer son mot de passe
              </p>
              <button
                type="button"
                onClick={generateMagicLink}
                className="btn-secondary mb-3"
              >
                Générer un Magic Link
              </button>
              {magicLink && (
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">URL à envoyer au client:</p>
                  <div className="bg-gray-100 dark:bg-gray-800 p-4 text-sm font-mono break-all border border-gray-300 dark:border-gray-600">
                    https://www.cryptonm.ch/magic/{magicLink}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    ⚠️ Enregistrez ce lien avant de créer le client
                  </p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3">
                {error}
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
                {loading ? 'Création...' : 'Créer le client'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
