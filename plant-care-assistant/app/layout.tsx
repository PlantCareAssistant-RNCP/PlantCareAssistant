// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#06141B] text-white min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
