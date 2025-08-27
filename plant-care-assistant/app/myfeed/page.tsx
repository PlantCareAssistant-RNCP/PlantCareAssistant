"use client";

import Link from "next/link";
import Icon from "@components/common/Icon";
import FeedCard from "@components/features/feed/FeedCard";
import { useEffect, useState } from "react";

export default function MyFeed() {
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/social/posts")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch posts");
        }
        return res.json();
      })
      .then((data) => setMyPosts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main role="main" aria-label="My feed page">
      <Link href="/dashboard" className="fixed top-15 left-2 z-50 p-2 pt-20">
        <Icon name="backIcon" size={50} />
      </Link>

      <div className="pt-40 max-w-md mx-auto px-4 space-y-4">
        <h1 className="text-white text-lg font-semibold">My posts</h1>

        {loading ? (
          <p className="text-gray-400 text-center mt-10" role="status">
            Loading...
          </p>
        ) : error ? (
          <p className="text-red-400 text-center mt-10" role="alert">
            {error}
          </p>
        ) : myPosts.length === 0 ? (
          <p className="text-gray-400 text-center mt-10" role="status">
            You haven’t posted anything yet.
          </p>
        ) : (
          <ul aria-label="List of your posts" className="space-y-4">
            {myPosts.map((post) => (
              <li key={post.post_id}>
                <Link href={`/post/${post.post_id}`}>
                  <FeedCard
                    id={post.post_id}
                    author={post.USER?.username || "Unknown"}
                    imageUrl={post.photo}
                    description={post.content}
                    createdAt={post.created_at}
                    authorId={post.USER?.id} commentsCount={0}                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link href="/createpost">
        <div className="fixed bottom-20 right-6 z-[9999]">
          <Icon name="buttonAddPost" size={70} />
        </div>
      </Link>
    </main>
  );
}
