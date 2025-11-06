'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrency } from '@/components/providers/CurrencyProvider'
import AssetAutocomplete from '@/components/shared/AssetAutocomplete'

export default function AddTransactionModal({
  clientId,
  onClose,
}: {
  clientId: string
  onClose: () => void
}) {
  const router = useRouter()
  const { currency, convertAmount, formatAmount } = useCurrency()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [priceError, setPriceError] = useState('')

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    type: 'buy',
    category: 'crypto',
    customCategory: '',
    asset: '',
    platform: '',
    amount: '',
    pricePerUnit: '',
    totalSpent: '', // Nueva: total gastado en fiat
    fees: '',
    feesCurrency: 'USD', // Currency for fees: USD, USDT, or asset
    targetPrice: '',
    targetPriceMax: '',
    targetIsRange: false,
    currentPrice: '',
    transactionDate: getTodayDate(), // Nueva: fecha de la transacción
    transactionTime: new Date().toTimeString().slice(0, 5), // Nueva: hora de la transacción
    isPresale: false,
    presaleEndDate: '',
    presaleTarget: '',
    // Transfer fields
    transferFrom: '',
    transferTo: '',
    transferAddress: '',
    notes: '',
  })

  const [inputMode, setInputMode] = useState<'amount' | 'total'>('amount') // Switch entre cantidad o total

  // Calculate profit/loss in real-time
  const calculateProfitLoss = () => {
    const amount = parseFloat(formData.amount) || 0
    const buyPrice = parseFloat(formData.pricePerUnit) || 0
    const currentPrice = parseFloat(formData.currentPrice) || 0
    const fees = parseFloat(formData.fees) || 0

    if (amount === 0 || buyPrice === 0 || currentPrice === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        profitLoss: 0,
        profitLossPercent: 0,
      }
    }

    const totalInvested = (amount * buyPrice) + fees
    const currentValue = amount * currentPrice
    const profitLoss = currentValue - totalInvested
    const profitLossPercent = (profitLoss / totalInvested) * 100

    return {
      totalInvested,
      currentValue,
      profitLoss,
      profitLossPercent,
    }
  }

  const stats = calculateProfitLoss()

  // Auto-calculate amount when totalSpent or pricePerUnit changes (in 'total' mode)
  useEffect(() => {
    if (inputMode === 'total' && formData.totalSpent && formData.pricePerUnit) {
      const total = parseFloat(formData.totalSpent)
      const price = parseFloat(formData.pricePerUnit)
      if (price > 0) {
        const calculatedAmount = total / price
        setFormData(prev => ({
          ...prev,
          amount: calculatedAmount.toFixed(8)
        }))
      }
    }
  }, [formData.totalSpent, formData.pricePerUnit, inputMode])

  // Auto-calculate totalSpent when amount or pricePerUnit changes (in 'amount' mode)
  useEffect(() => {
    if (inputMode === 'amount' && formData.amount && formData.pricePerUnit) {
      const amount = parseFloat(formData.amount)
      const price = parseFloat(formData.pricePerUnit)
      const calculatedTotal = amount * price
      setFormData(prev => ({
        ...prev,
        totalSpent: calculatedTotal.toFixed(2)
      }))
    }
  }, [formData.amount, formData.pricePerUnit, inputMode])

  // Set price to 0 for transfers
  useEffect(() => {
    if (formData.type.startsWith('transfer')) {
      setFormData(prev => ({
        ...prev,
        pricePerUnit: '0',
        totalSpent: '0',
        targetPrice: '',
        targetPriceMax: '',
        targetIsRange: false,
      }))
    }
  }, [formData.type])

  // Fetch historical price when date changes (for crypto category)
  useEffect(() => {
    const fetchHistoricalPrice = async () => {
      if (!formData.asset || formData.category !== 'crypto') {
        return
      }

      if (formData.asset.length < 2) {
        return
      }

      // Only fetch historical price if date is not today
      const today = getTodayDate()
      if (formData.transactionDate === today) {
        // Use current price for today
        return
      }

      setFetchingPrice(true)
      setPriceError('')

      try {
        const response = await fetch(`/api/crypto/historical-price?symbol=${formData.asset.toUpperCase()}&date=${formData.transactionDate}`)

        if (!response.ok) {
          throw new Error('Prix historique non trouvé')
        }

        const data = await response.json()

        // Convert price from USD to selected currency
        const priceInSelectedCurrency = convertAmount(data.price, 'USD')

        setFormData(prev => ({
          ...prev,
          pricePerUnit: priceInSelectedCurrency.toFixed(8)
        }))
        setPriceError('')
      } catch (err: any) {
        setPriceError('Prix historique non disponible - veuillez entrer manuellement')
        setFormData(prev => ({
          ...prev,
          pricePerUnit: ''
        }))
      } finally {
        setFetchingPrice(false)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(fetchHistoricalPrice, 800)
    return () => clearTimeout(timeoutId)
  }, [formData.asset, formData.category, formData.transactionDate, convertAmount])

  // Fetch current price when asset changes (for crypto category)
  useEffect(() => {
    const fetchPrice = async () => {
      if (!formData.asset || formData.category !== 'crypto') {
        return
      }

      if (formData.asset.length < 2) {
        return
      }

      setFetchingPrice(true)

      try {
        const response = await fetch(`/api/crypto/price?symbol=${formData.asset.toUpperCase()}`)

        if (!response.ok) {
          throw new Error('Prix non trouvé')
        }

        const data = await response.json()

        // Convert price from USD to selected currency
        const priceInSelectedCurrency = convertAmount(data.price, 'USD')

        setFormData(prev => ({
          ...prev,
          currentPrice: priceInSelectedCurrency.toFixed(8)
        }))
      } catch (err: any) {
        // Silently fail for current price
        setFormData(prev => ({
          ...prev,
          currentPrice: ''
        }))
      } finally {
        setFetchingPrice(false)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(fetchPrice, 800)
    return () => clearTimeout(timeoutId)
  }, [formData.asset, formData.category, convertAmount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const totalCost = parseFloat(formData.amount) * parseFloat(formData.pricePerUnit)

      // Convert prices back to USD for database storage
      let currentPriceUSD = formData.currentPrice ? parseFloat(formData.currentPrice) : null
      let pricePerUnitUSD = parseFloat(formData.pricePerUnit)

      if (currency !== 'USD') {
        // Convert back to USD
        if (currentPriceUSD) {
          currentPriceUSD = currentPriceUSD / convertAmount(1, 'USD')
        }
        pricePerUnitUSD = pricePerUnitUSD / convertAmount(1, 'USD')
      }

      const response = await fetch(`/api/admin/clients/${clientId}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          pricePerUnit: pricePerUnitUSD,
          totalCost: totalCost / (currency !== 'USD' ? convertAmount(1, 'USD') : 1),
          fees: formData.fees ? parseFloat(formData.fees) / (currency !== 'USD' ? convertAmount(1, 'USD') : 1) : 0,
          targetPrice: formData.targetPrice ? parseFloat(formData.targetPrice) / (currency !== 'USD' ? convertAmount(1, 'USD') : 1) : null,
          targetPriceMax: formData.targetIsRange && formData.targetPriceMax ? parseFloat(formData.targetPriceMax) / (currency !== 'USD' ? convertAmount(1, 'USD') : 1) : null,
          currentPrice: currentPriceUSD,
          presaleTarget: formData.presaleTarget ? parseFloat(formData.presaleTarget) / (currency !== 'USD' ? convertAmount(1, 'USD') : 1) : null,
          presaleEndDate: formData.presaleEndDate || null,
          isPresale: formData.category === 'presale' ? true : formData.isPresale,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création')
      }

      router.refresh()
      onClose()
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-nm-card-dark shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col card">
        {/* Fixed Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-2xl font-bold text-nm-text-secondary dark:text-nm-text-primary">
            Ajouter une transaction
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Type, Category, Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full"
                      required
                    >
                      <option value="buy">Achat</option>
                      <option value="sell">Vente</option>
                      <option value="transfer_in">Transfert Entrant</option>
                      <option value="transfer_out">Transfert Sortant</option>
                    </select>
                    {formData.type.startsWith('transfer') && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        {formData.type === 'transfer_in'
                          ? 'Réception de crypto (augmente portfolio sans achat)'
                          : 'Envoi de crypto (réduit portfolio sans vente)'}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Catégorie *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full"
                      required
                    >
                      <option value="crypto">Crypto</option>
                      <option value="nft">NFT</option>
                      <option value="real_estate">Immobilier</option>
                      <option value="presale">Presale</option>
                      <option value="memecoin">Memecoin</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Date *</label>
                    <input
                      type="date"
                      value={formData.transactionDate}
                      onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                      max={getTodayDate()}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium mb-2">Heure de transaction</label>
                  <input
                    type="time"
                    value={formData.transactionTime}
                    onChange={(e) => setFormData({ ...formData, transactionTime: e.target.value })}
                    className="w-full"
                  />
                </div>

                {formData.category === 'autre' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Catégorie personnalisée *</label>
                    <input
                      type="text"
                      value={formData.customCategory}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                      className="w-full"
                      required
                      placeholder="Ex: Actions, Métaux précieux..."
                    />
                  </div>
                )}

                {/* Asset and Platform */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Asset *
                    </label>
                    <AssetAutocomplete
                      value={formData.asset}
                      onChange={(value) => setFormData({ ...formData, asset: value })}
                      onSelect={(asset) => {
                        setFormData({ ...formData, asset: asset.symbol })
                      }}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Plateforme *</label>
                    <input
                      type="text"
                      value={formData.platform}
                      onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                      className="w-full"
                      required
                      placeholder="Ex: Binance, Coinbase..."
                    />
                  </div>
                </div>

                {/* Transfer Fields - Only show for transfers */}
                {formData.type.startsWith('transfer') && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded">
                    <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-300 mb-3">
                      Détails du transfert
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {formData.type === 'transfer_in' ? (
                        <>
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Provenance (wallet/exchange)
                            </label>
                            <input
                              type="text"
                              value={formData.transferFrom}
                              onChange={(e) => setFormData({ ...formData, transferFrom: e.target.value })}
                              className="w-full text-sm"
                              placeholder="Ex: Trezor Wallet"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Adresse source (optionnel)
                            </label>
                            <input
                              type="text"
                              value={formData.transferAddress}
                              onChange={(e) => setFormData({ ...formData, transferAddress: e.target.value })}
                              className="w-full text-sm font-mono"
                              placeholder="0x..."
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Destination (wallet/exchange)
                            </label>
                            <input
                              type="text"
                              value={formData.transferTo}
                              onChange={(e) => setFormData({ ...formData, transferTo: e.target.value })}
                              className="w-full text-sm"
                              placeholder="Ex: Ledger Nano"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">
                              Adresse destination (optionnel)
                            </label>
                            <input
                              type="text"
                              value={formData.transferAddress}
                              onChange={(e) => setFormData({ ...formData, transferAddress: e.target.value })}
                              className="w-full text-sm font-mono"
                              placeholder="0x..."
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Switch: Amount or Total - Hide for transfers */}
                {!formData.type.startsWith('transfer') && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setInputMode(inputMode === 'amount' ? 'total' : 'amount')}
                      className="flex items-center gap-2 px-3 py-2 bg-nm-header text-nm-text-primary hover:bg-opacity-90 transition-colors rounded text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      {inputMode === 'amount' ? `Quantité ${formData.asset || 'crypto'}` : `Total ${currency}`}
                    </button>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {inputMode === 'amount'
                        ? `Entrez la quantité → le total se calcule`
                        : `Entrez le total → la quantité se calcule`
                      }
                    </span>
                  </div>
                )}

                {/* Amount, Price, Fees */}
                <div className={`grid grid-cols-1 ${formData.type.startsWith('transfer') ? 'md:grid-cols-1' : 'md:grid-cols-3'} gap-6`}>
                  {/* Quantité */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Quantité {formData.asset ? formData.asset : ''} *
                      {!formData.type.startsWith('transfer') && inputMode === 'total' && <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(Auto)</span>}
                    </label>
                    <input
                      type="text"
                      value={formData.amount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '.')
                        setFormData({ ...formData, amount: value })
                      }}
                      className={`w-full ${!formData.type.startsWith('transfer') && inputMode === 'total' ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                      readOnly={!formData.type.startsWith('transfer') && inputMode === 'total'}
                      required
                      placeholder="0.00000000"
                    />
                  </div>

                  {/* Prix unitaire - Hidden for transfers */}
                  {!formData.type.startsWith('transfer') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Prix unitaire ({currency}) *
                      </label>
                      <input
                        type="text"
                        value={formData.pricePerUnit}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, '.')
                          setFormData({ ...formData, pricePerUnit: value })
                        }}
                        className="w-full"
                        required
                        placeholder={formData.category === 'crypto' ? 'Auto du ' + formData.transactionDate : '0.00'}
                      />
                      {priceError && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          ⚠️ {priceError}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Total gastado - Hidden for transfers */}
                  {!formData.type.startsWith('transfer') && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Total ({currency}) *
                        {inputMode === 'amount' && <span className="ml-1 text-xs text-blue-600 dark:text-blue-400">(Auto)</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.totalSpent}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, '.')
                          setFormData({ ...formData, totalSpent: value })
                        }}
                        className={`w-full ${inputMode === 'amount' ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                        readOnly={inputMode === 'amount'}
                        required
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>

                {/* Frais */}
                <div>
                  <label className="block text-sm font-medium mb-2">Frais</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <input
                        type="text"
                        value={formData.fees}
                        onChange={(e) => {
                          const value = e.target.value.replace(/,/g, '.')
                          setFormData({ ...formData, fees: value })
                        }}
                        className="w-full"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <select
                        value={formData.feesCurrency}
                        onChange={(e) => setFormData({ ...formData, feesCurrency: e.target.value })}
                        className="w-full"
                      >
                        <option value="USD">USD</option>
                        <option value="USDT">USDT</option>
                        <option value={formData.asset || 'ASSET'}>{formData.asset || 'Asset'}</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Monnaie utilisée pour payer les frais
                  </p>
                </div>

                {/* Target Price Section */}
                <div>
                  <label className="block text-sm font-medium mb-2">Target</label>

                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      checked={formData.targetIsRange}
                      onChange={(e) => setFormData({ ...formData, targetIsRange: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Target range (ex: 1-3 {currency})</span>
                  </label>

                  {formData.targetIsRange ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Prix min ({currency})</label>
                        <input
                          type="number"
                          value={formData.targetPrice}
                          onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                          className="w-full"
                          step="any"
                          min="0"
                          placeholder="1.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Prix max ({currency})</label>
                        <input
                          type="number"
                          value={formData.targetPriceMax}
                          onChange={(e) => setFormData({ ...formData, targetPriceMax: e.target.value })}
                          className="w-full"
                          step="any"
                          min="0"
                          placeholder="3.00"
                        />
                      </div>
                    </div>
                  ) : (
                    <input
                      type="number"
                      value={formData.targetPrice}
                      onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                      className="w-full"
                      step="any"
                      min="0"
                      placeholder="Ex: 2.00"
                    />
                  )}
                </div>

                {/* Current Price - Read only, auto-updated */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Prix actuel ({currency})
                    {fetchingPrice && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                        Mise à jour...
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.currentPrice}
                      readOnly
                      className="w-full bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
                      step="any"
                      min="0"
                      placeholder={formData.category === 'crypto' ? 'Auto (CoinMarketCap)' : 'N/A'}
                    />
                    {fetchingPrice && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="animate-spin h-5 w-5 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  {formData.category === 'crypto' && formData.currentPrice && !fetchingPrice && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                      ✓ Mis à jour en temps réel
                    </p>
                  )}
                </div>

                {/* Presale Options */}
                {formData.category !== 'presale' && (
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isPresale}
                        onChange={(e) => setFormData({ ...formData, isPresale: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium">C'est une Presale</span>
                    </label>
                  </div>
                )}

                {(formData.isPresale || formData.category === 'presale') && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-nm-accent">
                    <div>
                      <label className="block text-sm font-medium mb-2">Date de sortie</label>
                      <input
                        type="date"
                        value={formData.presaleEndDate}
                        onChange={(e) => setFormData({ ...formData, presaleEndDate: e.target.value })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Target Presale ({currency})</label>
                      <input
                        type="number"
                        value={formData.presaleTarget}
                        onChange={(e) => setFormData({ ...formData, presaleTarget: e.target.value })}
                        className="w-full"
                        step="any"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full"
                    rows={3}
                    placeholder="Ajoutez des notes ou commentaires..."
                  />
                </div>

                {error && (
                  <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary flex-1"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Live Preview */}
            <div className="lg:col-span-1">
              <div className="space-y-3">
                <h3 className="font-bold text-base text-nm-text-secondary dark:text-nm-text-primary mb-3">
                  📊 Aperçu
                </h3>

                {/* Total Invested */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 card">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total investi</p>
                  <p className="text-lg font-bold number-format text-blue-600 dark:text-blue-400">
                    {formatAmount(stats.totalInvested)}
                  </p>
                </div>

                {/* Current Value */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 card">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Valeur actuelle</p>
                  <p className="text-lg font-bold number-format text-purple-600 dark:text-purple-400">
                    {formatAmount(stats.currentValue)}
                  </p>
                </div>

                {/* Profit/Loss */}
                <div className={`p-3 card ${stats.profitLoss >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Profit/Perte</p>
                  <p className={`text-xl font-bold number-format ${stats.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats.profitLoss >= 0 ? '+' : ''}
                    {formatAmount(stats.profitLoss)}
                  </p>
                  <p className={`text-sm font-semibold ${stats.profitLoss >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stats.profitLoss >= 0 ? '+' : ''}
                    {stats.profitLossPercent.toFixed(2)}%
                  </p>
                </div>

                {/* Transaction Summary */}
                {formData.asset && formData.amount && formData.pricePerUnit && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 card text-xs space-y-1.5">
                    <h4 className="font-semibold mb-1.5 text-sm">Résumé</h4>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Asset:</span>
                      <span className="font-medium">{formData.asset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Quantité:</span>
                      <span className="font-medium number-format">{parseFloat(formData.amount || '0').toFixed(8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Prix d'achat:</span>
                      <span className="font-medium number-format">{formatAmount(parseFloat(formData.pricePerUnit || '0'))}</span>
                    </div>
                    {formData.currentPrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Prix actuel:</span>
                        <span className="font-medium number-format">{formatAmount(parseFloat(formData.currentPrice))}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Date:</span>
                      <span className="font-medium">
                        {new Date(formData.transactionDate + 'T' + formData.transactionTime).toLocaleString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
