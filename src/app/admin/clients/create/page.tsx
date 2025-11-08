'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import { useSession } from 'next-auth/react'
import { nanoid } from 'nanoid'
import Image from 'next/image'

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
    budgetCurrency: 'USD',
    commissionPercent: '',
    noCommission: false,
    avatar: '',
    letClientUpload: false,
    cardColor: '#1a1a2e',
    cardDesign: 'gradient',
    cardGradient: '#16213e',
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
          id: session.user.id,
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
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Sera converti en USD pour les opérations
                  </p>
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
                <div
                  className="w-full max-w-md aspect-[1.586/1] rounded-xl p-6 text-white shadow-2xl relative overflow-hidden"
                  style={{
                    background: formData.cardDesign === 'gradient'
                      ? `linear-gradient(135deg, ${formData.cardColor}, ${formData.cardGradient})`
                      : formData.cardDesign === 'pattern'
                      ? `${formData.cardColor} url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                      : formData.cardColor
                  }}
                >
                  <div className="absolute top-4 left-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center p-2">
                      <div className="relative w-full h-full">
                        <Image
                          src="/assets/logos/logo-nm.png"
                          alt="NM Logo"
                          fill
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="w-10 h-8 bg-yellow-400/80 rounded-md"></div>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-2xl font-bold mb-2">
                      {formData.firstName || 'Prénom'} {formData.lastName || 'Nom'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <div className="text-xs opacity-70">Valeur actuelle</div>
                        <div className="text-lg font-semibold">
                          {formData.budget ? `${parseFloat(formData.budget).toLocaleString()} ${formData.budgetCurrency}` : '0.00 USD'}
                        </div>
                      </div>
                      <div className="text-xs opacity-70">
                        Neftali Manzambi
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
