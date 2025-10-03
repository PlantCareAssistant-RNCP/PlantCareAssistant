"use client";

import { useState } from "react";
import { useAuth } from "providers/AuthProvider";
import Icon from "@components/common/Icon";

interface AddCommentInputProps {
  postId: number;
  onCommentAdded: () => void;
}

export default function AddCommentInput({ postId, onCommentAdded }: AddCommentInputProps) {
  const [commentContent, setCommentContent] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commentLoading, setCommentLoading] = useState(false);
  const { user: currentUser } = useAuth();

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError(null);

    if (!commentContent.trim()) {
      setCommentError("Comment cannot be empty.");
      return;
    }

    if (!currentUser) {
      setCommentError("You must be logged in to comment.");
      return;
    }

    setCommentLoading(true);
    try {
      const res = await fetch(`/api/social/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: commentContent }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add comment");
      }
      setCommentContent("");
      onCommentAdded();
    } catch (err: any) {
      setCommentError(err.message);
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 pb-10">
      <form
        className="flex items-center bg-white rounded-full px-4 py-2 gap-2 border border-gray-400 shadow-md"
        onSubmit={handleCommentSubmit}
      >
        <input
          type="text"
          placeholder="Write a comment here..."
          aria-label="Write a comment here"
          className="flex-grow bg-transparent text-sm placeholder-gray-600 text-black outline-none"
          value={commentContent}
          onChange={e => setCommentContent(e.target.value)}
          disabled={commentLoading}
        />
        <button
          type="submit"
          className="p-2 rounded-full min-w-[40px] min-h-[40px]"
          disabled={commentLoading}
        >
          <Icon name="sendIcon" size={24} />
        </button>
      </form>
      {commentError && (
        <div className="text-red-600 text-sm mt-2">{commentError}</div>
      )}
    </div>
  );
}