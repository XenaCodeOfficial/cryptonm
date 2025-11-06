'use client'

import { useState, useEffect, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<'admin' | 'client'>('client')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const message = searchParams.get('message')
    const emailParam = searchParams.get('email')

    if (message === 'password_configured') {
      setSuccessMessage('Mot de passe configuré avec succès! Vous pouvez maintenant vous connecter.')
      setUserType('client')
      if (emailParam) {
        setEmail(decodeURIComponent(emailParam))
      }
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        userType,
        redirect: false,
      })

      if (result?.error) {
        setError('Email ou mot de passe incorrect')
        setLoading(false)
        return
      }

      if (userType === 'admin') {
        router.push('/admin/dashboard')
      } else {
        router.push('/client/dashboard')
      }
      router.refresh()
    } catch (err) {
      setError('Une erreur est survenue')
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
        <div className="bg-nm-card-dark/90 backdrop-blur-sm shadow-2xl p-8 md:p-12">
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

          <h1 className="text-2xl font-bold text-center mb-8 text-white">
            Connexion
          </h1>

          {/* User Type Selector */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setUserType('client')}
              className={`flex-1 py-3 font-medium transition-all ${
                userType === 'client'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => setUserType('admin')}
              className={`flex-1 py-3 font-medium transition-all ${
                userType === 'admin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
                autoComplete="current-password"
              />
            </div>

            {successMessage && (
              <div className="bg-green-900/30 border border-green-700 text-green-400 px-4 py-3 text-sm">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Plateforme sécurisée de gestion crypto
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement...</div>}>
      <LoginForm />
    </Suspense>
  )
}
