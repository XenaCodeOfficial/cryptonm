'use client'

import Image from 'next/image'

type ClientCardProps = {
  client: {
    firstName: string
    lastName: string
    cardColor: string
    cardDesign: string
    cardGradient?: string | null
    totalCurrentValue: number
    budgetCurrency: string
  }
  className?: string
}

export default function ClientCard({ client, className = '' }: ClientCardProps) {
  const getBackground = () => {
    switch (client.cardDesign) {
      case 'gradient':
        return `linear-gradient(135deg, ${client.cardColor}, ${client.cardGradient || '#16213e'})`
      case 'pattern':
        return `${client.cardColor} url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      case 'solid':
      default:
        return client.cardColor
    }
  }

  return (
    <div
      className={`w-full max-w-md aspect-[1.586/1] rounded-2xl p-8 text-white shadow-2xl relative overflow-hidden ${className}`}
      style={{ background: getBackground() }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24"></div>

      {/* Logo */}
      <div className="absolute top-6 left-6">
        <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center p-3 border border-white/20">
          <div className="relative w-full h-full">
            <Image
              src="/assets/logos/logo-nm.png"
              alt="Cryptonm"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>

      {/* Chip */}
      <div className="absolute top-6 right-6">
        <div className="relative w-12 h-10">
          <Image
            src="/assets/images/chipset-card-credit.png"
            alt="Chip"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Card Info */}
      <div className="absolute bottom-8 left-8 right-8">
        <div className="mb-6">
          <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Titulaire</div>
          <div className="text-2xl font-bold tracking-wide">
            {client.firstName} {client.lastName}
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs opacity-60 uppercase tracking-wider mb-1">Portefeuille</div>
            <div className="text-xl font-bold">
              ${client.totalCurrentValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} USD
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-60 uppercase tracking-wider">Cryptonm</div>
            <div className="text-xs opacity-80 font-mono">
              {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
