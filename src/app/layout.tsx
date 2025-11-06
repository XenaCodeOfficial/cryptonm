import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { CurrencyProvider } from '@/components/providers/CurrencyProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'NM Crypto - Gestion de Portefeuille',
  description: 'Plateforme professionnelle de gestion crypto par Neftali Manzambi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          <CurrencyProvider>
            <div className="bg-website-overlay min-h-screen">
              {children}
            </div>
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
