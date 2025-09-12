import { useEffect, useState } from "react";
import FeedCard from "./FeedCard";
import Link from "next/link";

type Post = {
  id: number;
  authorId: string;
  username: string;
  description: string;
  imageUrl: string;
  commentsCount: number;
  date: string;
};

export default function FeedList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/social/feed")
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch feed");
        }
        return res.json();
      })
      .then((data) => {
        setPosts(
          data.map((post: any): Post => ({
            id: post.post_id,
            authorId: post.USER?.id ?? "",
            username: post.USER?.username ?? "Unknown",
            description: post.content,
            imageUrl: post.photo,
            commentsCount: post._count?.COMMENT ?? 0,
            date: post.created_at,
          }))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <p
        className="text-gray-400 text-center mt-10"
        role="status"
      >
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <p
        className="text-red-400 text-center mt-10"
        role="alert"
      >
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-4 mt-8">
      {posts.map((post) => (
        <div key={post.id}>
          <Link href={`/post/${post.id}`} className="block">
            <FeedCard
              id={post.id}
              authorId={post.authorId}
              username={post.username}
              description={post.description}
              imageUrl={post.imageUrl}
              commentsCount={post.commentsCount}
              date={post.date}
            />
          </Link>
        </div>
      ))}
    </div>
  );
}
