'use client'

import { useState, useEffect, useRef } from 'react'
import AssetLogo from './AssetLogo'

type Asset = {
  symbol: string
  name: string
  id: string
  rank: number
}

type AssetAutocompleteProps = {
  value: string
  onChange: (value: string) => void
  onSelect?: (asset: Asset) => void
  placeholder?: string
  required?: boolean
  className?: string
}

export default function AssetAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Ex: BTC, ETH, XRP...',
  required = false,
  className = '',
}: AssetAutocompleteProps) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<Asset[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Sync external value changes
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Fetch suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/crypto/search?query=${encodeURIComponent(query)}`)
        const data = await response.json()
        setSuggestions(data.assets || [])
        setShowSuggestions(data.assets?.length > 0)
      } catch (error) {
        console.error('Asset search error:', error)
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase()
    setQuery(newValue)
    onChange(newValue)
    setSelectedIndex(-1)
  }

  const handleSelectAsset = (asset: Asset) => {
    setQuery(asset.symbol)
    onChange(asset.symbol)
    setShowSuggestions(false)
    onSelect?.(asset)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectAsset(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true)
        }}
        className={`w-full ${className}`}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />

      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((asset, index) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => handleSelectAsset(asset)}
              className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left ${
                index === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/30' : ''
              } ${index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''}`}
            >
              <AssetLogo asset={asset.id} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {asset.symbol}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {asset.name}
                </div>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                #{asset.rank}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
