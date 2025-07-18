"use client";

import Link from "next/link";
import Icon from "@components/common/Icon";

export default function MyPlants() {
  return (
    <>
      <Link href="/dashboard" className="fixed top-15 left-2 z-50 p-2 pt-20">
        <Icon name="backIcon" size={50} />
      </Link>

      <div className="flex items-center justify-center pt-20">
        <p className="text-gray-600 text-xl font-medium">
          Here I will be able to see all my plants.
        </p>
      </div>

      <Link href="/createplant">
        <div className="fixed bottom-20 right-6 z-[9999] shadow-lg">
          <Icon name="buttonAddPost" size={70} />
        </div>
      </Link>
    </>
  );
}
