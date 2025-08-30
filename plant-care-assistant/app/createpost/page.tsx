"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { uploadPostImage } from "@utils/images";

interface Plant {
  plant_id: number;
  plant_name: string;
  photo: string;
  PLANT_TYPE?: {
    plant_type_name: string;
  };
  Event: Event[];
}

export default function CreatePostPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [plantId, setPlantId] = useState("");
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/plants")
      .then((res) => res.json())
      .then((data) => setPlants(data))
      .catch(() => setPlants([]));
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);

      // Upload to /api/upload
      setLoading(true);
      const url = await uploadPostImage(file); // this calls /api/upload with bucket: post-images
      setLoading(false);
      if (url) {
        setImageUrl(url);
      } else {
        setError("Failed to upload image");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Only send the image URL, not the file
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", description);
    postData.append("plant_id", plantId);
    if (imageUrl) postData.append("photo", imageUrl);

    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        body: postData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }

      setSuccess(true);
      router.push("/myfeed");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 px-6">
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-start gap-6">
        {imagePreview && (
          <div className="w-full max-w-md h-48 relative rounded-md overflow-hidden bg-gray-800 mb-4">
            <Image
              src={imagePreview}
              alt="Preview of the selected image"
              fill
              className="object-cover"
            />
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-6 text-white"
          aria-label="Create a new post"
        >
          {/* Image upload */}
          <section>
            <label
              htmlFor="image"
              className="block w-full h-12 bg-[#0A9788] text-white font-semibold text-center leading-[3rem] cursor-pointer rounded-full"
            >
              {imagePreview ? "Change picture" : "Choose a picture"}
            </label>
            <input
              id="image"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </section>

          {/* Title */}
          <section>
            <label htmlFor="title" className="block mb-1 font-semibold text-white">
              Add a title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-black"
              required
            />
          </section>

          {/* Description */}
          <section>
            <label htmlFor="description" className="block mb-1 font-semibold text-white">
              Add a description
            </label>
            <textarea
              id="description"
              placeholder="Write something..."
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-black resize-none min-h-[150px]"
              required
            />
          </section>

          {/* Plant selection */}
          <section>
            <label htmlFor="plant_id" className="block mb-1 font-semibold text-white">
              Select a plant
            </label>
            <select
              id="plant_id"
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-black"
              required
            >
              <option value="">Select a plant</option>
              {plants.map((plant) => (
                <option key={plant.plant_id} value={plant.plant_id}>
                  {plant.plant_name}
                  {plant.PLANT_TYPE?.plant_type_name
                    ? ` (${plant.PLANT_TYPE.plant_type_name})`
                    : ""}
                </option>
              ))}
            </select>
          </section>

          {/* Submit button */}
          <button
            type="submit"
            className="self-end bg-[#0A9788] text-white font-semibold px-6 py-2 rounded-full"
            aria-label="Submit post"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </form>

        {error && (
          <p className="text-red-400 text-center mt-4" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-400 text-center mt-4" role="status">
            Post created!
          </p>
        )}
      </div>
    </div>
  );
}
