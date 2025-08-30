"use client";

import Icon from "@components/common/Icon";
import Link from "next/link";
import { useRef, useState } from "react";
import DashboardModal from "@components/ui/DashboardModal";
import { useAuth } from "@providers/AuthProvider";
import logger from "@utils/logger";

export default function Header() {
  const dashboardRef = useRef<HTMLAnchorElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isLoading } = useAuth();

  // DEBUG: Log auth state changes
  logger.debug({
    hasUser: !!user,
    userId: user?.id,
    userEmail: user?.email,
    isLoading,
    timestamp: new Date().toISOString(),
    message: "Header Debug:",
  });

  const homeRoute = isLoading ? "/" : user ? "/dashboard" : "/";

  return (
    <header className="fixed top-0 left-0 w-full bg-[#0A1A24] px-4 py-3 flex justify-between items-center h-16 z-50">
      <Link href={homeRoute}>
        <Icon name="home" size={35} />
      </Link>

      <div className="flex items-center gap-4">
        <span
          ref={dashboardRef}
          onClick={() => setIsModalOpen((prev) => !prev)}
          className="cursor-pointer"
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
