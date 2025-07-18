'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { dummyPlants } from "@components/features/myplants/MockPlant"; // Mock

export default function EditPlant() {
  const { id } = useParams();
  const router = useRouter();
  const plantId = Array.isArray(id) ? id[0] : id;

  const [plant, setPlant] = useState<any | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const selected = dummyPlants.find((p) => p.id === Number(plantId));
    if (selected) {
      setPlant(selected);
      setTitle(selected.name);
      setDescription(selected.description);
      setImagePreview(selected.imageUrl);
    }
  }, [plantId]);

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

  const handleSave = () => {
    console.log("✅ Updated plant:", { title, description, imagePreview });
    setMessage("Plant updated successfully");
  };

  const handleDelete = () => {
    console.log("❌ Plant deleted:", plantId);
    setMessage("Plant deleted");
    setTimeout(() => {
      router.push("/myplants");
    }, 1500);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!plant)
    return (
      <p role="alert" className="text-white p-6">
        Plant not found.
      </p>
    );

  return (
    <main
      role="main"
      aria-label="Edit plant form"
      className="w-full flex justify-center px-4 pt-20 pb-10"
    >
      <section
        className="w-full max-w-md bg-[#01121A] text-white rounded-lg p-6 space-y-6"
        aria-labelledby="edit-plant-heading"
      >
        <h1 id="edit-plant-heading" className="text-lg font-semibold">
          Edit your plant
        </h1>

        {message && (
          <div
            role="status"
            aria-live="polite"
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-md"
          >
            {message}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
          aria-describedby="edit-plant-description"
        >
          <p id="edit-plant-description" className="sr-only">
            Use this form to update your plant’s name, description or image.
          </p>

          {/* Image preview */}
          {imagePreview && (
            <div
              className="w-full h-48 relative rounded-md overflow-hidden bg-gray-800"
              aria-label="Plant image preview"
            >
              <Image
                src={imagePreview}
                alt={`Image of ${title}`}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Upload image */}
          <section aria-labelledby="plant-image-upload">
            <h2 id="plant-image-upload" className="sr-only">
              Upload or change plant image
            </h2>
            <label
              htmlFor="image"
              className="flex items-center justify-center w-full h-12 bg-[#0A9788] text-white font-semibold cursor-pointer rounded-full transition hover:opacity-90"
              aria-label="Upload or change plant image"
            >
              {imagePreview ? "Change picture" : "Choose picture"}
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
          <section aria-labelledby="plant-name-label">
            <label
              htmlFor="title"
              id="plant-name-label"
              className="block text-sm font-semibold mb-1"
            >
              Plant name
            </label>
            <input
              id="title"
              type="text"
              className="w-full rounded-md bg-gray-300 text-black px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter plant name"
              aria-required="true"
              aria-label="Plant name"
            />
          </section>

          {/* Description */}
          <section aria-labelledby="plant-desc-label">
            <label
              htmlFor="description"
              id="plant-desc-label"
              className="block text-sm font-semibold mb-1"
            >
              Plant description
            </label>
            <textarea
              id="description"
              rows={6}
              className="w-full rounded-md bg-gray-300 text-black px-3 py-2 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write something..."
              aria-label="Plant description"
              aria-required="true"
            />
          </section>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="bg-[#B54747] hover:bg-red-700 text-white px-4 py-2 rounded-full transition"
              aria-label="Delete this plant"
            >
              Delete plant
            </button>
            <button
              type="submit"
              className="bg-[#0A9788] hover:bg-teal-700 text-white px-6 py-2 rounded-full transition"
              aria-label="Save changes to plant"
            >
              Save
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
