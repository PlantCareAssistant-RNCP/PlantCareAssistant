"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from "providers/AuthProvider";

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const postId = Number(id);

  const { user: currentUser } = useAuth();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [originalPhoto, setOriginalPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!postId || isNaN(postId)) {
      setError("Invalid post id.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/social/posts/${postId}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to fetch post");
        }
        const data = await res.json();

        // Verify ownership if we have currentUser
        if (currentUser && data.USER?.id && data.USER.id !== currentUser.id) {
          setError("Access denied. You are not allowed to edit this post.");
          setLoading(false);
          return;
        }

        setDescription(data.content ?? "");
        setImagePreview(data.photo ?? null);
        setOriginalPhoto(data.photo ?? null);
      } catch (err: any) {
        setError(err.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, currentUser?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
    } else {
      // user cleared the file input
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("content", description);
      // append image file if user selected one
      if (imageFile) {
        formData.append("image", imageFile);
      } else {
        // if original had an image but preview is now null, tell backend to remove
        if (originalPhoto && !imagePreview) {
          formData.append("removeImage", "true");
        }
      }

      const res = await fetch(`/api/social/posts/${postId}`, {
        method: "PUT",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to update post");
      }

      const updated = await res.json();
      setMessage("Post updated successfully ✅");
      // Redirect to post page after short delay
      setTimeout(() => router.push(`/post/${postId}`), 800);
    } catch (err: any) {
      setError(err.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    // Call delete endpoint (soft delete)
    try {
      setLoading(true);
      const res = await fetch(`/api/social/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete post");
      }
      setMessage("Post deleted");
      setTimeout(() => router.push('/myfeed'), 800);
    } catch (err: any) {
      setError(err.message || "Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <main className="flex justify-center items-center h-screen px-4">
        <p className="text-gray-400">Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex justify-center items-center h-screen px-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md max-w-md text-center">
          <p role="alert">{error}</p>
          <button
            onClick={() => router.push('/myfeed')}
            className="mt-4 underline text-sm text-red-600"
          >
            Back to My Feed
          </button>
        </div>
      </main>
    );
  }

  return (
    <main role="main" aria-label="Edit post page" className="w-full flex justify-center px-4 py-12">
      <section
        className="w-full max-w-md bg-[#01121A] text-white rounded-lg p-6 space-y-6"
        aria-labelledby="edit-post-heading"
      >
        <h1 id="edit-post-heading" className="text-lg font-semibold">Edit your post</h1>

        {message && (
          <div role="status" className="bg-green-600 text-white text-sm px-4 py-2 rounded-md">
            {message}
          </div>
        )}

        {imagePreview && (
          <div className="w-full h-48 relative rounded-md overflow-hidden bg-gray-800">
            <Image
              src={imagePreview}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <section>
            <label htmlFor="image" className="block w-full h-12 bg-[#0A9788] text-white font-semibold text-center leading-[3rem] cursor-pointer rounded-full">
              {imagePreview ? 'Change image' : 'Choose image'}
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </section>

          <section>
            <label htmlFor="description" className="block text-sm font-semibold mb-1">
              Post description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your post..."
              rows={5}
              className="w-full rounded-md px-3 py-2 text-black resize-none min-h-[100px]"
              aria-label="Edit post description"
            />
          </section>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-[#B54747] hover:bg-red-700 text-white px-4 py-2 rounded-full transition"
              aria-label="Delete this post"
            >
              Delete
            </button>
            <button
              type="submit"
              className="bg-[#0A9788] hover:bg-teal-700 text-white px-6 py-2 rounded-full transition"
              aria-label="Save post changes"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
