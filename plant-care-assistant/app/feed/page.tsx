"use client";

import FeedList from '@/components/Feed/FeedList';

export default function FeedPage() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Feed</h1>
      <FeedList />
    </main>
  );
}