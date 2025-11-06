'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type Client = {
  id: string
  email: string
  firstName: string
  lastName: string
  password: string | null
}

export default function MagicLinkClient({ client }: { client: Client }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [needsPassword, setNeedsPassword] = useState(!client.password)

  useEffect(() => {
    // Si el cliente ya tiene password, redirigir al login
    if (client.password) {
      router.push('/login?message=use_normal_login')
    }
  }, [client.password, router])

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/client/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          password,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la configuration du mot de passe')
      }

      // Redirigir al login después de configurar el password
      router.push('/login?message=password_configured&email=' + encodeURIComponent(client.email))
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/assets/images/bg-login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-nm-card-dark shadow-2xl p-8 md:p-12">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="logo-container relative w-48 h-24">
              <Image
                src="/assets/logos/logo-nm.png"
                alt="NM Crypto"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-4 text-nm-text-secondary dark:text-nm-text-primary">
            Bienvenue, {client.firstName}!
          </h1>

          {needsPassword ? (
            <>
              <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                Configurez votre mot de passe pour accéder à votre compte
              </p>

              <form onSubmit={handleSetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Configuration...' : 'Configurer et continuer'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connexion en cours...
              </p>
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-nm-header"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
