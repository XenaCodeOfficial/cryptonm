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
      className={`w-full max-w-md aspect-[1.586/1] rounded-xl p-6 text-white shadow-2xl relative overflow-hidden ${className}`}
      style={{ background: getBackground() }}
    >
      {/* Logo */}
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

      {/* Chip simulation */}
      <div className="absolute top-4 right-4">
        <div className="w-10 h-8 bg-yellow-400/80 rounded-md"></div>
      </div>

      {/* Card Info */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="text-2xl font-bold mb-2">
          {client.firstName} {client.lastName}
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-xs opacity-70">Valeur actuelle</div>
            <div className="text-lg font-semibold">
              {client.totalCurrentValue.toLocaleString('fr-FR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{' '}
              {client.budgetCurrency}
            </div>
          </div>
          <div className="text-xs opacity-70">
            Neftali Manzambi
          </div>
        </div>
      </div>
    </div>
  )
}
