'use client'

import Icon from '@/components/icon'
import Link from 'next/link'
import { useRef, useState } from 'react'
import DashboardModal from '@/components/ui/DashboardModal'

export default function Header() {
  const dashboardRef = useRef<HTMLAnchorElement>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 w-full bg-[#0A1A24] px-4 py-3 flex justify-between items-center h-16 z-50">
      <Link href="/">
        <Icon name="home" size={35} />
      </Link>

      <span
        ref={dashboardRef}
        onClick={() => setIsModalOpen((prev) => !prev)}
        className="cursor-pointer"
      >
        <Icon name="dashboard" size={35} />
      </span>

      <DashboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        anchorRef={dashboardRef}
      />
    </header>
  )
}
