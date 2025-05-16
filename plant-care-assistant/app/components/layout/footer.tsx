// components/layout/footer.tsx
'use client'

import Icon from '@/components/icon'

export default function Footer() {
  return (
    <footer className="w-full relative bg-[#0A1A24] py-6">
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
        <button className="bg-[#0A9788] w-16 h-16 rounded-full flex items-center justify-center shadow-md">
          <Icon name="photo" size={48} className="text-black" />
        </button>
      </div>
    </footer>
  )
}
