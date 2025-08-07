'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Icon from "@components/common/Icon";
import { useAuth } from "@providers/AuthProvider";

interface Plant {
  plant_id: number;
  plant_name: string;
  photo: string;
  created_at: string;
  PLANT_TYPE?: {
    plant_type_name: string;
  };
  Event: Array<{
    id: number;
    title: string;
    start: string;
  }>;
}

export default function PlantDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoading: authLoading } = useAuth();
  const plantId = Array.isArray(id) ? id[0] : id;

  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlant = async () => {
      if (!plantId || authLoading) return;

      try {
        const response = await fetch(`/api/plants/${plantId}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 404) {
            setError("Plant not found");
          } else {
            setError("Failed to load plant");
          }
          return;
        }

        const plantData = await response.json();
        setPlant(plantData);
      } catch {
        setError("Failed to load plant");
      } finally {
        setLoading(false);
      }
    };

    fetchPlant();
  }, [plantId, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="pt-20 px-6">
        <div className="text-white text-center">Loading...</div>
      </div>
    );
  }

  if (error || !plant) {
    return (
      <div className="pt-20 px-6">
        <Link href="/myplants" className="fixed top-15 left-2 z-50 p-2 pt-20">
          <Icon name="backIcon" size={50} />
        </Link>
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Plant not found"}</p>
          <Link href="/myplants" className="text-[#0A9788] underline">
            Back to My Plants
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

        <div className="w-full max-w-md bg-[#01121A] text-white rounded-lg p-6 space-y-6">
          <h1 className="text-lg font-semibold text-center">{plant.plant_name}</h1>

          {/* Plant Image */}
          {plant.photo && (
            <div className="w-full h-48 relative rounded-md overflow-hidden bg-gray-800">
              <Image
                src={plant.photo.startsWith('http') || plant.photo.startsWith('/') ? plant.photo : `/${plant.photo}`}
                alt={plant.plant_name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-plant.jpg';
                }}
              />
            </div>
          )}

          {/* Plant Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-300">Species</h3>
              <p className="text-white">{plant.PLANT_TYPE?.plant_type_name || "Unknown"}</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-300">Added</h3>
              <p className="text-white">{new Date(plant.created_at).toLocaleDateString()}</p>
            </div>

            {plant.Event && plant.Event.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300">Recent Care Events</h3>
                <div className="space-y-2">
                  {plant.Event.slice(0, 3).map((event) => (
                    <div key={event.id} className="bg-gray-800 p-2 rounded">
                      <p className="text-sm text-white">{event.title}</p>
                      <p className="text-xs text-gray-400">{new Date(event.start).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push(`/plants/${plant.plant_id}/edit`)}
              className="flex-1 bg-[#0A9788] hover:bg-[#087a6e] text-white py-2 rounded-full transition-colors"
            >
              Edit Plant
            </button>
            <button
              onClick={() => router.push(`/calendar?plant=${plant.plant_id}`)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-full transition-colors"
            >
              Add Care Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
