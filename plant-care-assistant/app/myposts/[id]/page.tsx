'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { dummyPosts } from '@components/features/feed/FeedList';

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();

  const currentUserId = "6"; // ou celui que tu veux

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const post = dummyPosts.find((p) => p.id === Number(id));

    if (!post) {
      setError('Post not found.');
      return;
    }

    if (post.authorId !== currentUserId) {
      setError('Access denied. You are not allowed to edit this post.');
      return;
    }

    setDescription(post.description);
    setImagePreview(post.imageUrl);
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // 🧪 à remplacer avec appel API réel
    console.log('✅ Post updated:', { id, description, imagePreview });
    setMessage('Post updated successfully ✅');
  };

  const handleDelete = () => {
    // 🧪 à remplacer avec appel API réel
    console.log('❌ Post deleted:', id);
    setMessage('Post deleted');

    setTimeout(() => {
      router.push('/myfeed');
    }, 1500);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
    <main
      role="main"
      aria-label="Edit post page"
      className="w-full flex justify-center px-4 py-12"
    >
      <section
        className="w-full max-w-md bg-[#01121A] text-white rounded-lg p-6 space-y-6"
        aria-labelledby="edit-post-heading"
      >
        <h1 id="edit-post-heading" className="text-lg font-semibold">
          Edit your post
        </h1>

        {message && (
          <div
            role="status"
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-md"
          >
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
          {/* IMAGE UPLOAD */}
          <section>
            <label
              htmlFor="image"
              className={`block w-full h-12 bg-[#0A9788] text-white font-semibold text-center leading-[3rem] cursor-pointer rounded-full ${
                imagePreview ? 'opacity-80 hover:opacity-100' : ''
              }`}
              aria-label="Upload or change image"
            >
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

          {/* DESCRIPTION */}
          <section>
            <label
              htmlFor="description"
              className="block text-sm font-semibold mb-1"
            >
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

          {/* BUTTONS */}
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
              Save
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
