'use client'

import { useCurrency } from '@/components/providers/CurrencyProvider'
import { format } from 'date-fns'
import { useState, useMemo } from 'react'
import AssetLogo from '@/components/shared/AssetLogo'
import { getCryptoName } from '@/lib/cryptoNames'
import RealtimePrice from '@/components/shared/RealtimePrice'

type Transaction = {
  id: string
  type: string
  category: string
  customCategory: string | null
  asset: string
  platform: string
  amount: number
  pricePerUnit: number
  totalCost: number
  fees: number
  targetPrice: number | null
  targetPriceMax: number | null
  currentPrice: number | null
  profitLoss: number
  profitLossPercent: number
  createdAt: Date
}

type GroupedAsset = {
  asset: string
  category: string
  customCategory: string | null
  transactions: Transaction[]
  totalAmount: number
  totalInvested: number
  totalCurrentValue: number
  totalProfitLoss: number
  totalProfitLossPercent: number
  avgBuyPrice: number
  currentPrice: number | null
}

export default function ClientTransactionsView({ transactions }: { transactions: Transaction[] }) {
  const { formatAmount, currency } = useCurrency()
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set())

  // Group transactions by asset
  const groupedAssets: GroupedAsset[] = useMemo(() => {
    const groups: Record<string, GroupedAsset> = {}

    transactions.forEach(tx => {
      if (!groups[tx.asset]) {
        groups[tx.asset] = {
          asset: tx.asset,
          category: tx.category,
          customCategory: tx.customCategory,
          transactions: [],
          totalAmount: 0,
          totalInvested: 0,
          totalCurrentValue: 0,
          totalProfitLoss: 0,
          totalProfitLossPercent: 0,
          avgBuyPrice: 0,
          currentPrice: tx.currentPrice,
        }
      }

      groups[tx.asset].transactions.push(tx)
      groups[tx.asset].totalAmount += tx.amount
      groups[tx.asset].totalInvested += tx.totalCost + tx.fees

      if (tx.currentPrice) {
        groups[tx.asset].totalCurrentValue += tx.amount * tx.currentPrice
        groups[tx.asset].currentPrice = tx.currentPrice
      } else {
        groups[tx.asset].totalCurrentValue += tx.totalCost
      }
    })

    Object.values(groups).forEach(group => {
      group.avgBuyPrice = group.totalInvested / group.totalAmount
      group.totalProfitLoss = group.totalCurrentValue - group.totalInvested
      group.totalProfitLossPercent = group.totalInvested > 0
        ? (group.totalProfitLoss / group.totalInvested) * 100
        : 0
      group.transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    })

    return Object.values(groups).sort((a, b) => b.totalInvested - a.totalInvested)
  }, [transactions])

  const toggleAsset = (asset: string) => {
    setExpandedAssets(prev => {
      const newSet = new Set(prev)
      if (newSet.has(asset)) {
        newSet.delete(asset)
      } else {
        newSet.add(asset)
      }
      return newSet
    })
  }

  const getCategoryLabel = (category: string, customCategory: string | null) => {
    if (category === 'autre' && customCategory) {
      return customCategory
    }
    const labels: Record<string, string> = {
      crypto: 'Crypto',
      nft: 'NFT',
      real_estate: 'Immobilier',
      presale: 'Presale',
      memecoin: 'Memecoin',
    }
    return labels[category] || category
  }

  // Get locale based on currency
  const getLocale = () => {
    switch (currency) {
      case 'USD':
        return 'en-US' // 1,000.50
      case 'EUR':
        return 'de-DE' // 1.000,50
      case 'CHF':
        return 'de-CH' // 1'000.50 or 1 000,50
      default:
        return 'en-US'
    }
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat(getLocale(), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num)
  }

  // Format crypto amounts - removes trailing zeros but keeps separators
  const formatCryptoAmount = (num: number) => {
    // First format with separators based on currency
    const formatted = new Intl.NumberFormat(getLocale(), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 8,
    }).format(num)

    // Remove trailing zeros after decimal point
    // Handle both comma and dot as decimal separators
    const decimalSeparator = currency === 'USD' ? '.' : ','
    const regex1 = new RegExp(`\\${decimalSeparator}0+$`)
    const regex2 = new RegExp(`\\${decimalSeparator}(\\d*?)0+$`)
    return formatted.replace(regex1, '').replace(regex2, `${decimalSeparator}$1`)
  }

  // Format price with dynamic decimals (for small values like TEL)
  const formatPrice = (value: number): string => {
    const { symbol } = (() => {
      switch (currency) {
        case 'USD': return { symbol: '$' }
        case 'EUR': return { symbol: '€' }
        case 'CHF': return { symbol: 'CHF' }
        default: return { symbol: '$' }
      }
    })()

    let formatted: string

    // Dynamic decimals based on value size
    if (value >= 1) {
      formatted = new Intl.NumberFormat(getLocale(), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)
    } else if (value >= 0.01) {
      formatted = new Intl.NumberFormat(getLocale(), {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }).format(value)
    } else {
      formatted = new Intl.NumberFormat(getLocale(), {
        minimumFractionDigits: 6,
        maximumFractionDigits: 6,
      }).format(value)
    }

    return currency === 'USD' ? `${symbol}${formatted}` : `${formatted} ${symbol}`
  }

  // Helper to get the first transaction with a target price
  const getTransactionWithTarget = (transactions: Transaction[]) => {
    return transactions.find(tx => tx.targetPrice !== null)
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-nm-card-dark p-12 text-center border border-gray-200 dark:border-gray-700">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Aucune transaction
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Vos transactions apparaîtront ici
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Banking-style compact table - Identical to Admin */}
      <div className="bg-white dark:bg-nm-card-dark border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header - Hidden on mobile */}
        <div className="hidden md:block bg-nm-header text-nm-text-primary border-b border-gray-300 dark:border-gray-600">
          <div className="grid grid-cols-[2.5fr_1.2fr_1fr_1.2fr_1.2fr_1.2fr_1.2fr_1.5fr] gap-2 px-4 py-3 text-sm font-semibold">
            <div className="text-left">Asset</div>
            <div className="text-center">Precio Actual</div>
            <div className="text-center">Prix d'Achat</div>
            <div className="text-center">Quantité</div>
            <div className="text-center">Prix Moyen</div>
            <div className="text-center">Valeur</div>
            <div className="text-center">Target</div>
            <div className="text-center">Profit/Perte</div>
          </div>
        </div>

        {/* Rows */}
        {groupedAssets.map((group, index) => (
          <div key={group.asset}>
            {/* Asset Row - Clickable */}
            <div
              onClick={() => toggleAsset(group.asset)}
              className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-100 dark:border-gray-800 ${
                index % 2 === 0 ? 'bg-white dark:bg-nm-card-dark' : 'bg-gray-50/50 dark:bg-gray-900/20'
              }`}
            >
              {/* Mobile Card Layout */}
              <div className="md:hidden px-4 py-4">
                <div className="flex items-start gap-3 mb-3">
                  <AssetLogo asset={group.asset} size="md" />
                  <div className="flex-1">
                    <div className="font-semibold text-base text-nm-text-secondary dark:text-nm-text-primary mb-1">
                      {getCryptoName(group.asset)}{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-normal text-sm">
                        {group.asset}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {group.transactions.length} transactions • {getCategoryLabel(group.category, group.customCategory)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Precio Actual</div>
                    <div className="font-medium text-blue-600 dark:text-blue-400">
                      <RealtimePrice asset={group.asset} />
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prix d'Achat</div>
                    <div className="font-medium">{formatAmount(group.totalInvested)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Quantité</div>
                    <div className="font-medium">{formatCryptoAmount(group.totalAmount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Prix Moyen</div>
                    <div className="font-medium">{formatPrice(group.avgBuyPrice)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Valeur Actuelle</div>
                    <div className="font-semibold">{formatAmount(group.totalCurrentValue)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target</div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {(() => {
                        const txWithTarget = getTransactionWithTarget(group.transactions)
                        return txWithTarget?.targetPrice ? (
                          txWithTarget.targetPriceMax ? (
                            <span className="text-sm">
                              {formatAmount(txWithTarget.targetPrice)} - {formatAmount(txWithTarget.targetPriceMax)}
                            </span>
                          ) : (
                            <span className="text-sm">{formatAmount(txWithTarget.targetPrice)}</span>
                          )
                        ) : (
                          <span className="text-gray-400 dark:text-gray-600">—</span>
                        )
                      })()}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Profit/Perte</div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-base font-bold ${
                          group.totalProfitLoss >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {group.totalProfitLoss >= 0 ? '+' : ''}
                        {formatAmount(group.totalProfitLoss)}
                      </span>
                      <span
                        className={`text-sm ${
                          group.totalProfitLossPercent >= 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        ({group.totalProfitLossPercent >= 0 ? '+' : ''}
                        {formatNumber(group.totalProfitLossPercent, 2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:grid md:grid-cols-[2.5fr_1.2fr_1fr_1.2fr_1.2fr_1.2fr_1.2fr_1.5fr] gap-2 px-4 py-3 items-center">
                {/* Asset */}
                <div className="flex items-center gap-3">
                  <AssetLogo asset={group.asset} size="sm" />
                  <div>
                    <div className="font-semibold text-nm-text-secondary dark:text-nm-text-primary">
                      {getCryptoName(group.asset)}{' '}
                      <span className="text-blue-600 dark:text-blue-400 font-normal">
                        {group.asset}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {group.transactions.length} tx
                    </div>
                  </div>
                </div>

                {/* Precio Actual */}
                <div className="text-center text-sm font-medium text-blue-600 dark:text-blue-400">
                  <RealtimePrice asset={group.asset} />
                </div>

                {/* Prix d'Achat */}
                <div className="text-center text-sm font-medium">
                  {formatAmount(group.totalInvested)}
                </div>

                {/* Quantity */}
                <div className="text-center text-sm font-medium">
                  {formatCryptoAmount(group.totalAmount)}
                </div>

                {/* Average Price */}
                <div className="text-center text-sm font-medium">
                  {formatPrice(group.avgBuyPrice)}
                </div>

                {/* Current Value */}
                <div className="text-center text-sm font-semibold">
                  {formatAmount(group.totalCurrentValue)}
                </div>

                {/* Target - First transaction with target */}
                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  {(() => {
                    const txWithTarget = getTransactionWithTarget(group.transactions)
                    return txWithTarget?.targetPrice ? (
                      txWithTarget.targetPriceMax ? (
                        <span>
                          {formatAmount(txWithTarget.targetPrice)} - {formatAmount(txWithTarget.targetPriceMax)}
                        </span>
                      ) : (
                        <span>{formatAmount(txWithTarget.targetPrice)}</span>
                      )
                    ) : (
                      <span className="text-gray-400 dark:text-gray-600">—</span>
                    )
                  })()}
                </div>

                {/* Profit/Loss */}
                <div className="text-center">
                  <div
                    className={`text-sm font-bold ${
                      group.totalProfitLoss >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {group.totalProfitLoss >= 0 ? '+' : ''}
                    {formatAmount(group.totalProfitLoss)}
                  </div>
                  <div
                    className={`text-xs ${
                      group.totalProfitLossPercent >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {group.totalProfitLossPercent >= 0 ? '+' : ''}
                    {formatNumber(group.totalProfitLossPercent, 2)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded: Individual Transactions */}
            {expandedAssets.has(group.asset) && (
              <div className="bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
                <div className="px-4 py-3">
                  <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase">
                    Historique des transactions
                  </div>

                  {/* Individual transaction table */}
                  <div className="bg-white dark:bg-nm-card-dark border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Sub-header */}
                    <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-[2fr_1fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr] gap-2 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                        <div>Date</div>
                        <div>Type</div>
                        <div>Plateforme</div>
                        <div className="text-right">Quantité</div>
                        <div className="text-right">Prix</div>
                        <div className="text-right">Target</div>
                        <div className="text-right">P/L</div>
                      </div>
                    </div>

                    {/* Transaction rows */}
                    {group.transactions.map((tx, txIndex) => (
                      <div
                        key={tx.id}
                        className={`grid grid-cols-[2fr_1fr_2fr_1.5fr_1.5fr_1.5fr_1.5fr] gap-2 px-3 py-2 items-center text-sm border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
                          txIndex % 2 === 0 ? 'bg-white dark:bg-nm-card-dark' : 'bg-gray-50/50 dark:bg-gray-900/20'
                        }`}
                      >
                        {/* Date */}
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {format(new Date(tx.createdAt), 'dd/MM/yyyy HH:mm')}
                        </div>

                        {/* Type */}
                        <div>
                          <span
                            className={`text-xs font-semibold ${
                              tx.type === 'buy'
                                ? 'text-green-600 dark:text-green-400'
                                : tx.type === 'sell'
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {tx.type === 'buy'
                              ? 'BUY'
                              : tx.type === 'sell'
                              ? 'SELL'
                              : tx.type === 'transfer_in'
                              ? '↓ IN'
                              : '↑ OUT'}
                          </span>
                        </div>

                        {/* Platform */}
                        <div className="text-xs text-gray-700 dark:text-gray-300">
                          {tx.platform}
                        </div>

                        {/* Quantity */}
                        <div className="text-right text-xs font-medium">
                          {formatNumber(tx.amount, 8).replace(/[.,]?0+$/, '')}
                        </div>

                        {/* Price */}
                        <div className="text-right text-xs font-medium">
                          {formatAmount(tx.pricePerUnit)}
                        </div>

                        {/* Target */}
                        <div className="text-right text-xs text-gray-600 dark:text-gray-400">
                          {tx.targetPrice ? (
                            tx.targetPriceMax ? (
                              <span>
                                {formatAmount(tx.targetPrice)} - {formatAmount(tx.targetPriceMax)}
                              </span>
                            ) : (
                              <span>{formatAmount(tx.targetPrice)}</span>
                            )
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">—</span>
                          )}
                        </div>

                        {/* Profit/Loss */}
                        <div className="text-right">
                          <div
                            className={`text-xs font-bold ${
                              tx.profitLoss >= 0
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {tx.profitLoss >= 0 ? '+' : ''}
                            {formatAmount(tx.profitLoss)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
