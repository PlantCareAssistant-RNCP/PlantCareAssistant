"use client";

import Image from "next/image";

export default function Logo({ size = 200 }: { size?: number }) {
  return (
    <Image
      src="/PlantCare_Logo.png"
      alt="PlantCare Logo"
      width={size}
      height={size}
      className="rounded-full"
      priority
    />
  );
}
