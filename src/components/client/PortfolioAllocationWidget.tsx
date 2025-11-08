'use client'

import { useState, useEffect } from 'react'
import PortfolioPieChart from '@/components/charts/PortfolioPieChart'

type AssetAllocation = {
  asset: string
  value: number
  percentage: number
}

export default function PortfolioAllocationWidget() {
  const [allocations, setAllocations] = useState<AssetAllocation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllocations()
  }, [])

  const fetchAllocations = async () => {
    try {
      const response = await fetch('/api/client/portfolio-allocation')
      if (response.ok) {
        const data = await response.json()
        setAllocations(data.allocations)
      }
    } catch (error) {
      console.error('Error fetching allocations:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-nm-card-dark shadow-md p-6 card h-full">
      <h2 className="text-xl font-semibold mb-6 text-nm-text-secondary dark:text-nm-text-primary">
        Portfolio Distribution
      </h2>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nm-accent"></div>
        </div>
      ) : (
        <div className="h-64 md:h-80">
          <PortfolioPieChart allocations={allocations} />
        </div>
      )}
    </div>
  )
}
