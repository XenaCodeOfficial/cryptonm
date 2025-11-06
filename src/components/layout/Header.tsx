'use client'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useCurrency } from '@/components/providers/CurrencyProvider'
import { useState } from 'react'

type HeaderProps = {
  user: {
    name: string
    email: string
    avatar?: string | null
  }
  role: 'admin' | 'client'
}

export default function Header({ user, role }: HeaderProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const { currency, setCurrency } = useCurrency()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="bg-nm-header text-nm-text-primary shadow-lg">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Logo and Name */}
          <div className="flex items-center gap-4">
            <div className="logo-container relative w-32 h-12">
              <Image
                src="/assets/logos/logo-nm.png"
                alt="NM Crypto"
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
            {role === 'admin' && (
              <span className="text-lg font-semibold border-l border-nm-accent pl-4">
                Neftali Manzambi
              </span>
            )}
          </div>

          {/* Right: Controls and User */}
          <div className="flex items-center gap-6">
            {/* Currency Selector */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2">
              {(['USD', 'EUR', 'CHF'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-3 py-1 text-sm font-medium transition-all ${
                    currency === curr
                      ? 'bg-nm-accent text-nm-text-secondary'
                      : 'text-nm-text-primary hover:bg-white/10'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-white/10 transition-colors"
              title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              )}
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 hover:bg-white/10 p-2 transition-colors"
              >
                {role === 'admin' ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src="/assets/logos/profile-picture-nm.png"
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : user.avatar ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-nm-accent text-nm-text-secondary rounded-full flex items-center justify-center font-semibold">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="text-left hidden md:block">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-nm-accent">{role === 'admin' ? 'Admin' : 'Client'}</div>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-nm-card-dark shadow-xl z-50">
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
