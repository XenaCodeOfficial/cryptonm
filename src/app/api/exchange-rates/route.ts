import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Use Frankfurter API - free, no API key required, data from European Central Bank
    const response = await fetch(
      'https://api.frankfurter.app/latest?base=USD&symbols=EUR,CHF',
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates')
    }

    const data = await response.json()

    // Frankfurter returns rates with USD as base
    const rates = {
      USD: 1,
      EUR: data.rates.EUR,
      CHF: data.rates.CHF,
    }

    return NextResponse.json({
      rates,
      lastUpdated: data.date,
      source: 'European Central Bank (via Frankfurter API)',
    })
  } catch (error) {
    console.error('Exchange rates fetch error:', error)

    // Fallback to approximate rates if API fails
    return NextResponse.json({
      rates: {
        USD: 1,
        EUR: 0.92,
        CHF: 0.88,
      },
      lastUpdated: new Date().toISOString().split('T')[0],
      source: 'Fallback rates',
      error: 'Using fallback rates due to API error',
    })
  }
}
