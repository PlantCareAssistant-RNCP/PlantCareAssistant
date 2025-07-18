"use client";

import { useState } from "react";
import Image from "next/image";

export default function CreatePostPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ title, description, imagePreview });
  };

  return (
    <div className="pt-20 px-6">
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-start gap-6">
        
        {/* Preview image en haut */}
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

        {/* Formulaire */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md flex flex-col gap-6 text-white"
          aria-label="Create a new post"
        >
          {/* Section image */}
          <section aria-labelledby="image-upload">
            <h2 id="image-upload" className="sr-only">
              Upload an image
            </h2>

            <label
              htmlFor="image"
              className={`flex items-center justify-center w-full h-12 mt-2 bg-[#0A9788] text-white font-semibold cursor-pointer rounded-full ${
                imagePreview ? "opacity-80 hover:opacity-100" : ""
              }`}
              aria-label="Upload or change picture"
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

          {/* Titre */}
          <section aria-labelledby="title-section">
            <label
              htmlFor="title"
              id="title-section"
              className="block mb-1 font-semibold text-white"
            >
              Add a title
            </label>
            <input
              id="title"
              type="text"
              placeholder="Enter a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-black"
            />
          </section>

          {/* Description */}
          <section aria-labelledby="desc-section">
            <label
              htmlFor="description"
              id="desc-section"
              className="block mb-1 font-semibold text-white"
            >
              Add a description
            </label>
            <textarea
              id="description"
              placeholder="Write something..."
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md px-3 py-2 text-black resize-none min-h-[150px]"
            />
          </section>

          {/* Bouton submit */}
          <button
            type="submit"
            className="self-end bg-[#0A9788] text-white font-semibold px-6 py-2 rounded-full"
            aria-label="Submit post"
          >
            Create
          </button>
        </form>
      </div>
    </div>
  );
}
