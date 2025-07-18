"use client";

import Link from "next/link";
import Icon from "@components/common/Icon";
import FeedCard from "@components/features/feed/FeedCard";
import { dummyPosts } from "@components/features/feed/FeedList";
import { useEffect, useState } from "react";

export default function MyFeed() {
  const [myPosts, setMyPosts] = useState<typeof dummyPosts>([]);

  useEffect(() => {
    // 🧪 En prod, remplace par la vraie auth
    const currentUsername = "John Doe";
    const myPostsFiltered = dummyPosts.filter((post) => post.username === currentUsername);
    setMyPosts(myPostsFiltered);
  }, []);

  return (
    <main role="main" aria-label="My feed page">
      <Link href="/dashboard" className="fixed top-15 left-2 z-50 p-2 pt-20">
        <Icon name="backIcon" size={50} />
      </Link>

      <div className="pt-40 max-w-md mx-auto px-4 space-y-4">
        <h1 className="text-white text-lg font-semibold">My posts</h1>

        {myPosts.length === 0 ? (
          <p className="text-gray-400 text-center mt-10" role="status">
            You haven’t posted anything yet.
          </p>
        ) : (
          <ul aria-label="List of your posts" className="space-y-4">
            {myPosts.map((post) => (
              <li key={post.id}>
                <Link href={`/post/${post.id}`}>
                  <FeedCard
                    id={post.id}
                    author={post.username}
                    imageUrl={post.imageUrl}
                    description={post.description}
                    createdAt={post.date}
                    authorId={post.username}
                  />
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
