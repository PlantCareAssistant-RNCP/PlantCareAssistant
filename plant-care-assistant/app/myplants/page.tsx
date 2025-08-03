"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@components/common/Icon";
import MyPlantCard from "@components/features/myplants/PlantCard";
import { useAuth } from "@providers/AuthProvider"

interface Event {
  id: number;
  title: string;
  start: string;
  end: string | null;
  userId: string;
  plantId: number | null;
  createdAt: string;
  updatedAt: string;
}

interface Plant {
  plant_id: number;
  plant_name: string;
  photo: string;
  PLANT_TYPE?: {
    plant_type_name: string;
  };
  Event: Event[];
}

export default function MyPlants() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use your existing AuthProvider
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    const fetchPlants = async () => {
      if (authLoading) return;
      
      try {
        console.log("🔍 Starting fetchPlants..."); // Debug
        console.log("👤 User from AuthProvider:", user); // Debug

        if (!user) {
          console.log("❌ No user found"); // Debug
          setError("Please log in to view your plants");
          setLoading(false);
          return;
        }

        console.log("✅ User authenticated, fetching plants..."); // Debug

        const response = await fetch("/api/plants", {
          credentials: 'include', // Include cookies for session-based auth
        });

        console.log("📡 API Response status:", response.status); // Debug

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ API Error:", errorText); // Debug
          throw new Error("Failed to fetch plants");
        }

        const plantsData = await response.json();
        console.log("🌱 Plants data:", plantsData); // Debug
        setPlants(plantsData);
      } catch (err) {
        console.error("💥 Error in fetchPlants:", err); // Debug
        setError(err instanceof Error ? err.message : "Failed to load plants");
      } finally {
        setLoading(false);
      }
    };

    fetchPlants();
  }, [user, authLoading]); // Depend on user from AuthProvider

  if (authLoading || loading) {
    return (
      <div className="max-w-md mx-auto pt-40 px-4">
        <Link href="/dashboard" className="fixed top-15 left-2 z-50 p-2 pt-20">
          <Icon name="backIcon" size={50} />
        </Link>
        <div className="text-white text-center">Loading your plants...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto pt-40 px-4">
        <Link href="/dashboard" className="fixed top-15 left-2 z-50 p-2 pt-20">
          <Icon name="backIcon" size={50} />
        </Link>
        <div className="text-red-400 text-center">{error}</div>
      </div>
    );
  }

  return (
    <>
      <Link href="/dashboard" className="fixed top-15 left-2 z-50 p-2 pt-20">
        <Icon name="backIcon" size={50} />
      </Link>

      <div className="max-w-md mx-auto pt-40 px-4 space-y-4">
        <h1 className="text-white text-lg font-semibold">My plant library</h1>

        {plants.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">
              No plants in your collection yet
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Start by adding your first plant!
            </p>
            <Link href="/createplant">
              <button className="bg-[#0A9788] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#087a6e] transition-colors">
                Add Your First Plant
              </button>
            </Link>
          </div>
        ) : (
          plants.map((plant) => (
            <Link
              href={`/plants/${plant.plant_id}`}
              key={plant.plant_id}
              className="block"
            >
              <MyPlantCard
                name={plant.plant_name}
                species={plant.PLANT_TYPE?.plant_type_name || "Unknown species"}
                imageUrl={plant.photo || "/default-plant.jpg"}
                isSelected={false}
              />
            </Link>
          ))
        )}
      </div>

      {/* Fixed floating action button */}
      <Link href="/createplant">
        <div className="fixed bottom-20 right-6 z-[9999] bg-[#0A9788] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-[#087a6e] transition-colors">
          <span className="text-3xl font-bold">+</span>
        </div>
      </Link>
    </>
  );
}
