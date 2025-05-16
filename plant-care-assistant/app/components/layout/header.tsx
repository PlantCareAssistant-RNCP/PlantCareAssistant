// components/layout/header.tsx
'use client'

import Icon from '@/components/icon'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full bg-[#0A1A24] px-4 py-3 flex justify-between items-center h-16 z-50">
      <Link href="/homepage">
        <Icon name="home" size={35} />
      </Link>
      <Link href="/userprofile">
        <Icon name="dashboard" size={35} />
      </Link>
    </header>
  )
}
