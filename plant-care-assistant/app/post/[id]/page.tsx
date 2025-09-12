"use client";

import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Icon from "@components/common/Icon";
import { useAuth } from "providers/AuthProvider";
import { useEffect, useState } from "react";

type Comment = {
  id: number;
  username: string;
  date: string;
  time: string;
  text: string;
};

type Post = {
  id: number;
  authorId: string;
  username: string;
  description: string;
  imageUrl: string;
  commentsCount: number;
  date: string;
  comments: Comment[];
};

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const postId = Number(params.id);
  const { user: currentUser } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/social/posts/${postId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to fetch post");
        }
        return res.json();
      })
      .then((data) => {
        // Map backend data to your frontend Post type if needed
        setPost({
          id: data.post_id,
          authorId: data.USER?.id ?? "",
          username: data.USER?.username ?? "Unknown",
          description: data.content,
          imageUrl: data.photo,
          commentsCount: data.COMMENT ? data.COMMENT.length : 0,
          date: data.created_at,
          comments: (data.COMMENT ?? []).map((c: any) => ({
            id: c.comment_id,
            username: c.USER?.username ?? "Anonymous",
            date: c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
            time: c.created_at ? new Date(c.created_at).toLocaleTimeString() : "",
            text: c.content,
          })),
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [postId]);

  const isOwner = post?.authorId === currentUser?.id;

  if (loading) {
    return (
      <main className="p-4">
        <p className="text-gray-500 font-semibold">Loading...</p>
      </main>
    );
  }

  if (error || !post) {
    return (
      <main className="p-4">
        <p className="text-red-500 font-semibold">{error || "Post not found."}</p>
      </main>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] pt-20 px-4">
      <div className="flex-1 overflow-y-auto space-y-4 pb-36">
        {/* Image + description */}
        <div className="bg-[#E8E8E8] rounded-xl p-3 shadow-sm border border-gray-300 space-y-3">
          <div className="relative w-full h-64 rounded-xl overflow-hidden">
            <Image
              src={post.imageUrl}
              alt={`Post by ${post.username}`}
              fill
              className="object-cover"
            />
            <Link href="/feed" className="fixed top-15 left-1 z-50 p-2">
              <Icon name="backIcon" size={50} />
            </Link>
          </div>

          <div className="rounded-xl p-2 space-y-2">
            <div className="flex justify-between text-sm font-semibold text-black">
              <span>{post.username}</span>
              <span>{post.date ?? "Non daté"}</span>
            </div>
            <p className="text-sm text-gray-700">{post.description}</p>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-2">
              <Icon name="commentBlack" size={20} />
              <span>{post.commentsCount}</span>
            </div>
          </div>

          {/* ✅ Bouton modifier si propriétaire */}
          {isOwner && (
            <div className="pt-2">
              <button
                onClick={() => router.push(`/editpost/${post.id}`)}
                className="w-full text-center text-sm text-white font-medium bg-[#0A9788] hover:bg-teal-700 py-2 rounded-full transition"
                aria-label="Edit this post"
              >
                Modifier
              </button>
            </div>
          )}
        </div>

        {/* Commentaires */}
        <div className="space-y-3">
          {(post.comments?.length ?? 0) > 0 ? (
            post.comments.map((comment: Comment) => (
              <div
                key={comment.id}
                className="bg-white rounded-xl shadow p-3 text-sm"
              >
                <div className="flex justify-between font-semibold text-black">
                  <span>{comment.username}</span>
                  <span className="text-xs text-gray-500">
                    {comment.date} {comment.time}
                  </span>
                </div>
                <p className="mt-1 text-gray-700">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No comments yet.</p>
          )}
        </div>
      </div>

      {/* Champ de commentaire */}
      <div className="fixed bottom-4 left-4 right-4 pb-10">
        <form className="flex items-center bg-white rounded-full px-4 py-2 gap-2 border border-gray-400 shadow-md">
          <input
            type="text"
            placeholder="Write a comment here..."
            aria-label="Write a comment here"
            className="flex-grow bg-transparent text-sm placeholder-gray-600 text-black outline-none"
          />
          <button
            type="submit"
            className="p-2 rounded-full min-w-[40px] min-h-[40px]"
          >
            <Icon name="sendIcon" size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}
