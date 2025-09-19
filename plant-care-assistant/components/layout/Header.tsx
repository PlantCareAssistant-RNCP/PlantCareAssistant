"use client";

import Icon from "@components/common/Icon";
import Link from "next/link";
import { useRef, useState } from "react";
import DashboardModal from "@components/ui/DashboardModal";
import { useAuth } from "@providers/AuthProvider";
import logger from "@utils/logger";

export default function Header() {
  const dashboardRef = useRef<HTMLElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading } = useAuth();

  const homeRoute = isLoading ? "/" : user ? "/dashboard" : "/";

  return (
    <header className="fixed top-0 left-0 w-full bg-[#0A1A24] px-4 py-3 flex justify-between items-center h-16 z-50">
      <Link href="/" aria-label="Home">
        <Icon name="home" size={35} />
      </Link>

      <div className="flex items-center gap-4">
        <span
          aria-label="Open the dashboard menu"
          ref={dashboardRef}
          onClick={() => setIsModalOpen((prev) => !prev)}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
              e.preventDefault();
              setIsModalOpen((prev) => !prev);
            }
          }}
        >
          <Icon name="dashboard" size={35} />
        </span>
      </div>

      <DashboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        anchorRef={dashboardRef}
      />
    </header>
  );
}
