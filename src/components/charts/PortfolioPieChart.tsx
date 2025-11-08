'use client'

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'react-chartjs-2'
import { useCurrency } from '@/components/providers/CurrencyProvider'

ChartJS.register(ArcElement, Tooltip, Legend)

type AssetAllocation = {
  asset: string
  value: number
  percentage: number
}

type PortfolioPieChartProps = {
  allocations: AssetAllocation[]
}

export default function PortfolioPieChart({ allocations }: PortfolioPieChartProps) {
  const { formatAmount } = useCurrency()

  // Generate colors for each asset
  const colors = [
    '#F7931A', // Bitcoin Orange
    '#627EEA', // Ethereum Blue
    '#26A17B', // Tether Green
    '#8247E5', // Polygon Purple
    '#F3BA2F', // Binance Yellow
    '#E84142', // Solana Purple/Red
    '#345D9D', // Cardano Blue
    '#00D395', // USD Coin Green
    '#FF4500', // Other Red-Orange
    '#4169E1', // Royal Blue
    '#32CD32', // Lime Green
    '#FF6347', // Tomato
    '#9370DB', // Medium Purple
    '#20B2AA', // Light Sea Green
    '#FFA500', // Orange
  ]

  const data = {
    labels: allocations.map((a) => `${a.asset} (${a.percentage.toFixed(1)}%)`),
    datasets: [
      {
        label: 'Portfolio Distribution',
        data: allocations.map((a) => a.value),
        backgroundColor: colors.slice(0, allocations.length),
        borderColor: colors.slice(0, allocations.length).map((c) => c),
        borderWidth: 2,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          color: 'rgb(156, 163, 175)', // gray-400
        },
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || ''
            const value = context.parsed || 0
            return `${label}: ${formatAmount(value)}`
          },
        },
      },
    },
  }

  if (allocations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 opacity-50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <p className="text-sm">No data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <Pie data={data} options={options} />
    </div>
  )
}
