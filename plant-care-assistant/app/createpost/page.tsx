"use client";

export default function CreatePostPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Créer une nouvelle publication</h1>
      {/* Formulaire à venir ici */}
      <form>
        <input
          type="text"
          placeholder="Titre ou description"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="file"
          accept="image/*"
          className="mb-4"
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Publier
        </button>
      </form>
    </div>
  );
}
