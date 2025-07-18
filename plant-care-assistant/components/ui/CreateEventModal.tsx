import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { DateTime } from "luxon";
import logger from "@utils/logger"

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  onEventCreated: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  onEventCreated,
}) => {
  const { session } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [plantId, setPlantId] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plants, setPlants] = useState<
    Array<{ plant_id: number; plant_name: string }>
  >([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setTitle("");
      setPlantId("");
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPlants = async () => {
      if (!isOpen || !session?.access_token) return;

      try {
        setIsLoadingPlants(true);
        const response = await fetch("/api/plants", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPlants(data);
        } else {
          logger.error("Failed to fetch plants");
        }
      } catch (err) {
        logger.error("Error fetching plants:", err);
      } finally {
        setIsLoadingPlants(false);
      }
    };

    fetchPlants();
  }, [isOpen, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Event title is required");
      return;
    }

    if (!session?.access_token) {
      setError("You must be logged in to create events");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const startDateTime = DateTime.fromJSDate(selectedDate);
      const endDateTime = startDateTime.endOf("day");

      const eventData = {
        title: title.trim(),
        start: startDateTime.toISO(),
        end: endDateTime.toISO(),
        plantId: plantId === "" ? null : plantId,
      };

      // Add debug logging
      logger.info("Sending event data:", eventData);
      logger.info("Event data types:", {
        title: typeof eventData.title,
        start: typeof eventData.start,
        end: typeof eventData.end,
        plantId: typeof eventData.plantId,
      });

      const response = await fetch(`/api/users/${session.user?.id}/events`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        onEventCreated();
        onClose();
      } else {
        const errorData = await response.json();
        logger.error("=== API ERROR DETAILS ===");
        logger.error("Status:", response.status);
        logger.error("Status Text:", response.statusText);
        logger.error("Error Data:", errorData);
        logger.error(
          "Response Headers:",
          Object.fromEntries(response.headers.entries())
        );
        setError(
          errorData.message || errorData.error || "Failed to create event"
        );
      }
    } catch (err) {
      logger.error("Error creating event:", err);
      setError("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          Create New Event
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="p-2 bg-gray-100 rounded border text-gray-700">
              {selectedDate.toLocaleDateString()}
            </div>
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Event Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="e.g., Water plants, Fertilize roses"
              required
            />
          </div>

          <div>
            <label
              htmlFor="plantId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Plant (Optional)
            </label>
            {isLoadingPlants ? (
              <div className="p-2 text-gray-500 text-sm">Loading plants...</div>
            ) : (
              <select
                id="plantId"
                value={plantId}
                onChange={(e) =>
                  setPlantId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="">No specific plant</option>
                {plants.map((plant) => (
                  <option key={plant.plant_id} value={plant.plant_id}>
                    {plant.plant_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;
