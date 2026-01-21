"use client";

import Link from "next/link";
import Icon from "@components/common/Icon";
import FeedList from "@components/features/feed/FeedList";

export default function MyFeed() {
  return (
    <main role="main" aria-label="My feed page">
      <Link href="/dashboard" className="fixed top-15 left-2 z-50 p-2 pt-20">
        <Icon name="backIcon" size={50} />
      </Link>

      <div className="pt-40 max-w-md mx-auto px-4 space-y-4">
        <h1 className="text-white text-lg font-semibold">My posts</h1>
        <FeedList mode='mine' />
      </div>

      <Link href="/createpost">
        <div className="fixed bottom-20 right-6 z-[9999]">
          <Icon name="buttonAddPost" size={70} />
        </div>
      </Link>
    </main>
  );
}
