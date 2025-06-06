// components/layout/footer.tsx
"use client";

import Icon from "@components/common/Icon";

export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[#0A1A24] py-6 z-10">
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
        <button className="w-16 h-16 rounded-full flex items-center justify-center shadow-md">
          <Icon name="photo" size={70} className="text-black" />
        </button>
      </div>
    </footer>
  );
}
