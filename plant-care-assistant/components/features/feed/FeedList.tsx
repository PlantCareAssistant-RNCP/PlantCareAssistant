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

interface FeedListProps {
  propPosts?: Post[];
  propLoading?: boolean;
  propError?: string | null;
  mode?: "all" | "mine";
  fetchUrl?: string;
}

export default function FeedList({
  propPosts,
  propLoading,
  propError,
  mode = "all",
  fetchUrl,
}: FeedListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapToPost = (item: any): Post => ({
    id: item.post_id ?? item.id,
    authorId: item.USER?.id ?? item.user_id ?? "",
    username: item.USER?.username ?? item.username ?? "Unknown",
    description: item.content ?? item.description ?? "",
    imageUrl: item.photo ?? item.imageUrl ?? "",
    commentsCount:
      item._count?.COMMENT ??
      (Array.isArray(item.COMMENT) ? item.COMMENT.length : 0) ??
      0,
    date: item.created_at ?? item.date ?? "",
  });

  useEffect(() => {
    if (propPosts) {
      setPosts(propPosts);
      setLoading(propLoading ?? false);
      setError(propError ?? null);
      return;
    }
    const endpoint =
      fetchUrl ?? (mode === "mine" ? "/api/social/posts" : "/api/social/feed");
    setLoading(true);
    setError(null);

    fetch(endpoint, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch feed");
        }
        return res.json();
      })
      .then((data) => setPosts(data.map(mapToPost)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [propPosts, propLoading, propError, mode, fetchUrl]);

  if (loading) {
    return (
      <p className="text-gray-400 text-center mt-10" role="status">
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-red-400 text-center mt-10" role="alert">
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
