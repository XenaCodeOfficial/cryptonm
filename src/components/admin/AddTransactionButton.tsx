'use client'

import { useState } from 'react'
import AddTransactionModal from './AddTransactionModal'

export default function AddTransactionButton({ clientId }: { clientId: string }) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="btn-primary px-4 sm:px-6 py-2 sm:py-3 inline-flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Ajouter une transaction
      </button>

      {showModal && (
        <AddTransactionModal clientId={clientId} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}
