'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type AdminProfileClientProps = {
  admin: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

export default function AdminProfileClient({ admin }: AdminProfileClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [formData, setFormData] = useState({
    name: admin.name,
    email: admin.email,
    avatar: admin.avatar || '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
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
      setError('Erreur lors du téléchargement de la photo')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          avatar: formData.avatar,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour du profil')
      }

      setSuccess('Profil mis à jour avec succès')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas')
      return
    }

    if (passwordData.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise à jour du mot de passe')
      }

      setSuccess('Mot de passe mis à jour avec succès')
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
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
          Paramètres du Profil
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-400 px-4 py-3 mb-6">
          {success}
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white dark:bg-nm-card-dark shadow-md p-8 card mb-6">
        <h2 className="text-xl font-semibold mb-6 text-nm-text-secondary dark:text-nm-text-primary">
          Informations du Profil
        </h2>

        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium mb-2">Photo de Profil</label>
            <div className="flex items-center gap-6">
              {formData.avatar ? (
                <div className="relative w-24 h-24">
                  <Image
                    src={formData.avatar}
                    alt="Avatar"
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-nm-accent text-nm-text-secondary rounded-full flex items-center justify-center font-bold text-2xl">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploadingAvatar}
                  className="w-full"
                />
                {uploadingAvatar && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Téléchargement...</p>}
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
              required
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
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

          <div className="flex gap-4">
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
              {loading ? 'Enregistrement...' : 'Enregistrer les Modifications'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-nm-card-dark shadow-md p-8 card">
        <h2 className="text-xl font-semibold mb-6 text-nm-text-secondary dark:text-nm-text-primary">
          Changer le Mot de Passe
        </h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Mot de Passe Actuel</label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Nouveau Mot de Passe</label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full"
              required
              minLength={8}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Minimum 8 caractères
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirmer le Nouveau Mot de Passe</label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
              className="btn-secondary flex-1"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Mise à jour...' : 'Mettre à Jour le Mot de Passe'}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
