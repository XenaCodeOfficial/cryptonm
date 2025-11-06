'use client'

import { useState, useEffect } from 'react'
import { useCurrency } from '@/components/providers/CurrencyProvider'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type CryptoData = {
  id: number
  name: string
  symbol: string
  image?: string
  quote: {
    USD: {
      price: number
      percent_change_24h: number
      market_cap: number
      volume_24h?: number
    }
  }
}

type HistoricalPrice = {
  timestamp: number
  price: number
}

export default function CryptoMarketWidget() {
  const [cryptos, setCryptos] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null)
  const [historicalData, setHistoricalData] = useState<HistoricalPrice[]>([])
  const [loadingChart, setLoadingChart] = useState(false)
  const { currency } = useCurrency()

  useEffect(() => {
    fetchCryptos()
    const interval = setInterval(fetchCryptos, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const fetchCryptos = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/crypto/market-data')
      const data = await response.json()
      setCryptos(data.cryptos || [])
    } catch (error) {
      console.error('Error fetching crypto data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoricalData = async (symbol: string) => {
    try {
      setLoadingChart(true)
      const response = await fetch(`/api/crypto/historical-price?symbol=${symbol}&days=30`)
      const data = await response.json()
      setHistoricalData(data.prices || [])
    } catch (error) {
      console.error('Error fetching historical data:', error)
      setHistoricalData([])
    } finally {
      setLoadingChart(false)
    }
  }

  const handleCryptoClick = (symbol: string) => {
    setSelectedCrypto(symbol)
    fetchHistoricalData(symbol)
  }

  const filteredCryptos = cryptos.filter(crypto =>
    crypto.name.toLowerCase().includes(search.toLowerCase()) ||
    crypto.symbol.toLowerCase().includes(search.toLowerCase())
  )

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price)
    } else if (price >= 0.01) {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(price)
    } else {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }).format(price)
    }
  }

  const formatMarketCap = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toFixed(0)}`
  }

  const chartData = {
    labels: historicalData.map(d => new Date(d.timestamp).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: selectedCrypto || undefined,
        data: historicalData.map(d => d.price),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `$${formatPrice(context.parsed.y)}`
          }
        }
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value: any) {
            return `$${formatPrice(value)}`
          }
        }
      }
    }
  }

  return (
    <div className="bg-white dark:bg-nm-card-dark border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une crypto (BTC, ETH, XRP, TEL, SEI...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 Cliquez sur une crypto pour voir son graphique
        </div>
      </div>

      {/* Chart */}
      {selectedCrypto && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedCrypto} - 30 derniers jours
            </h3>
            <button
              onClick={() => setSelectedCrypto(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div style={{ height: '300px' }}>
            {loadingChart ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : historicalData.length > 0 ? (
              <Line data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Pas de données disponibles
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  24h %
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cap. Marché
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCryptos.map((crypto, index) => (
                <tr
                  key={crypto.id}
                  onClick={() => handleCryptoClick(crypto.symbol)}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={crypto.image || `https://via.placeholder.com/32/3B82F6/FFFFFF?text=${crypto.symbol.charAt(0)}`}
                        alt={crypto.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          // Fallback to a placeholder if image fails to load
                          e.currentTarget.src = `https://via.placeholder.com/32/3B82F6/FFFFFF?text=${crypto.symbol.charAt(0)}`
                        }}
                      />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {crypto.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {crypto.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                    ${formatPrice(crypto.quote.USD.price)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold">
                    <span
                      className={
                        crypto.quote.USD.percent_change_24h >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }
                    >
                      {crypto.quote.USD.percent_change_24h >= 0 ? '+' : ''}
                      {crypto.quote.USD.percent_change_24h?.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                    {formatMarketCap(crypto.quote.USD.market_cap)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Données mises à jour toutes les minutes</span>
          <a
            href="https://www.coingecko.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 transition-colors"
          >
            Powered by CoinGecko
          </a>
        </div>
      </div>
    </div>
  )
}
