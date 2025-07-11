"use client";

export default function CreatePlantPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ajouter une nouvelle plante</h1>
      {/* Formulaire à venir ici */}
      <form>
        <input
          type="text"
          placeholder="Name"
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
          Ajouter
        </button>
      </form>
    </div>
  );
}
