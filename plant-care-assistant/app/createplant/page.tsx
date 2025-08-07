"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Icon from "@components/common/Icon";
import { useAuth } from "@providers/AuthProvider";
import { uploadPlantImage } from "@utils/images"; 

interface PlantType {
  plant_type_id: number;
  plant_type_name: string;
}

export default function CreatePlant() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [plantName, setPlantName] = useState("");
  const [selectedPlantType, setSelectedPlantType] = useState<number | null>(null);
  const [plantTypes, setPlantTypes] = useState<PlantType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [customPlantType, setCustomPlantType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchPlantTypes = async () => {
      try {
        const response = await fetch('/api/plant-types');
        if (response.ok) {
          const types = await response.json();
          setPlantTypes(types);
        }
      } catch (err) {
        console.error('Failed to fetch plant types:', err);
      }
    };

    fetchPlantTypes();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plantName.trim()) {
      setError("Plant name is required");
      return;
    }

    if (!selectedPlantType && !customPlantType.trim()) {
      setError("Please select a plant type or enter a custom one");
      return;
    }

    if (!user) {
      setError("Please log in to create a plant");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let finalPlantTypeId = selectedPlantType;

      if (selectedPlantType === -1 && customPlantType.trim()) {
        const plantTypeResponse = await fetch('/api/plant-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ plant_type_name: customPlantType.trim() }),
        });

        if (plantTypeResponse.ok) {
          const newPlantType = await plantTypeResponse.json();
          finalPlantTypeId = newPlantType.plant_type_id;
        } else if (plantTypeResponse.status === 409) {
          const errorData = await plantTypeResponse.json();
          finalPlantTypeId = errorData.existingType.plant_type_id;
        } else {
          throw new Error('Failed to create custom plant type');
        }
      }

      let photoUrl = "default_plant.jpg";
      
      if (selectedFile && user.id) {
        const uploadResult = await uploadPlantImage(selectedFile);
        if (!uploadResult) {
          setError("Failed to upload image");
          return;
        }
        photoUrl = uploadResult;
      }

      const plantData = {
        plant_name: plantName.trim(),
        plant_type_id: finalPlantTypeId,
        photo: photoUrl
      };

      const response = await fetch('/api/plants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(plantData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create plant');
      }

      const newPlant = await response.json();
      setSuccess(`"${newPlant.plant_name}" created successfully!`);
      
      setTimeout(() => {
        router.push('/myplants');
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create plant');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="pt-20 px-6">
        <div className="text-white text-center">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-20 px-6">
        <div className="text-center">
          <p className="text-white mb-4">Please log in to create a plant</p>
          <Link href="/login" className="text-[#0A9788] underline">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 px-6">
      <div className="min-h-[calc(100vh-5rem)] flex flex-col items-center justify-start gap-6">
        
        <Link href="/myplants" className="fixed top-15 left-2 z-50 p-2 pt-20">
          <Icon name="backIcon" size={50} />
        </Link>

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
          aria-label="Create a new plant"
        >
          {error && (
            <div className="bg-red-600 text-white text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-600 text-white text-sm px-4 py-2 rounded-md">
              {success}
            </div>
          )}

          <section aria-labelledby="image-upload">
            <label
              htmlFor="image"
              className={`flex items-center justify-center w-full h-12 mt-2 bg-[#0A9788] text-white font-semibold cursor-pointer rounded-full ${
                imagePreview ? "opacity-80 hover:opacity-100" : ""
              }`}
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

          <section aria-labelledby="plant-name">
            <label
              htmlFor="plantName"
              id="plant-name"
              className="block mb-1 font-semibold text-white"
            >
              Plant Name
            </label>
            <input
              id="plantName"
              type="text"
              value={plantName}
              onChange={(e) => setPlantName(e.target.value)}
              placeholder="Enter a name..."
              className="w-full rounded-md px-3 py-2 text-black"
              required
            />
          </section>

          <section aria-labelledby="plant-type">
            <label
              htmlFor="plantType"
              id="plant-type"
              className="block mb-1 font-semibold text-white"
            >
              Plant Type
            </label>
            <select
              id="plantType"
              value={selectedPlantType === -1 ? "other" : selectedPlantType || ""}
              onChange={(e) => {
                if (e.target.value === "other") {
                  setSelectedPlantType(-1);
                } else {
                  setSelectedPlantType(Number(e.target.value));
                  setCustomPlantType('');
                }
              }}
              className="w-full rounded-md px-3 py-2 text-black"
              required
            >
              <option value="">Select a plant type</option>
              {plantTypes.map((type) => (
                <option key={type.plant_type_id} value={type.plant_type_id}>
                  {type.plant_type_name}
                </option>
              ))}
              <option value="other">Other (specify below)</option>
            </select>

            {selectedPlantType === -1 && (
              <input
                type="text"
                value={customPlantType}
                onChange={(e) => setCustomPlantType(e.target.value)}
                placeholder="Enter custom plant type (e.g., Exotic Orchid)"
                className="w-full rounded-md px-3 py-2 text-black mt-2"
                required
              />
            )}
          </section>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold transition-colors ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-[#0A9788] hover:bg-[#087a6e] text-white'
            }`}
          >
            {loading ? 'Creating Plant...' : 'Create Plant'}
          </button>
        </form>
      </div>
    </div>
  );
}
