'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface DashboardModalProps {
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
}

export default function DashboardModal({ isOpen, onClose, anchorRef }: DashboardModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (isOpen && anchorRef.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 8, // 8px sous l’icône
        left: rect.right - 256, // modale alignée par la droite (w-64 = 256px)
      })
    }
  }, [isOpen, anchorRef])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-start justify-start">
      <div
        ref={modalRef}
        className="absolute w-64 bg-white rounded-xl shadow-lg p-6"
        style={{ top: position.top, left: position.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <nav className="flex flex-col gap-4">
        <Link href="/login" className="text-lg font-semibold text-gray-900 text-left">
            Login
          </Link>
          <Link href="/register" className="text-lg font-semibold text-gray-900 text-left">
            Register
          </Link>          
          <Link href="/dashboard" className="text-lg font-semibold text-gray-900 text-left">
            Dashboard
          </Link>
          <Link href="/userprofile" className="text-lg font-semibold text-gray-900 text-left">
            Personal Info
          </Link>
        </nav>
      </div>
    </div>
  )
}
