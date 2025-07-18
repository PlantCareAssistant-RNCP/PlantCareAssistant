"use client";

import FeedList from "@components/features/feed/FeedList";
import Icon from "@components/common/Icon";
import Link from "next/link";

export default function FeedPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Feed</h1>
      <FeedList />

      {/* Bouton flottant */}
      <Link href="/createpost">
        <div className="fixed bottom-20 right-6 z-[9999] shadow-lg">
          <Icon name="buttonAddPost" size={70} />
        </div>
      </Link>
    </main>
  );
}
