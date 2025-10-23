import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";
import { DateTime } from "luxon";
import logger from "@utils/logger";

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
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [plantId, setPlantId] = useState<number | "">("");
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plants, setPlants] = useState<
    Array<{ plant_id: number; plant_name: string }>
  >([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatMonthly, setRepeatMonthly] = useState(false);

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
      setIsAllDay(true);
      setStartTime("09:00");
      setEndTime("10:00");
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchPlants = async () => {
      if (!isOpen || !user) return;

      try {
        setIsLoadingPlants(true);
        const response = await fetch("/api/plants", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          logger.error({
            endpoint: "/api/plants",
            status: response.status,
            message: "Plants fetch failed",
          });
        } else {
          const data = await response.json();
          setPlants(data);
        }
      } catch (err) {
        logger.error({
          endpoint: "/api/plants",
          error: err instanceof Error ? err.message : "Unknown error",
          message: "Plants fetch network error",
        });
      } finally {
        setIsLoadingPlants(false);
      }
    };

    fetchPlants();
  }, [isOpen, user]); // FIX 3: Change dependency from session to user

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Event title is required");
      return;
    }
    if (!isAllDay) {
      if (startTime >= endTime) {
        setError("End time must be after start time");
        return;
      }
    }

    if (!user) {
      setError("You must be logged in to create events");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const startDateTime = DateTime.fromJSDate(selectedDate).set({
        hour: isAllDay ? 0 : Number(startTime.split(":")[0]),
        minute: isAllDay ? 0 : Number(startTime.split(":")[1]),
      });
      const endDateTime = DateTime.fromJSDate(selectedDate).set({
        hour: isAllDay ? 23 : Number(endTime.split(":")[0]),
        minute: isAllDay ? 59 : Number(endTime.split(":")[1]),
      });

      const eventData = {
        title: title.trim(),
        start: startDateTime.toISO(),
        end: endDateTime.toISO(),
        plantId: plantId === "" ? null : plantId,
        repeatWeekly,
        repeatMonthly,
      };

      const response = await fetch(`/api/users/${user.id}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        onEventCreated();
        onClose();
      } else {
        logger.error({
          endpoint: `/api/users/${user.id}/events`,
          status: response.status,
          eventTitle: title.trim(),
          hasPlant: plantId !== "",
          message: "Event creation failed",
        });

        const errorData = await response.json();
        setError(
          errorData.message || errorData.error || "Failed to create event"
        );
      }
    } catch (err) {
      logger.error({
        endpoint: `/api/users/${user.id}/events`,
        error: err instanceof Error ? err.message : "Unknown error",
        eventTitle: title.trim(),
        message: "Event creation network error",
      });
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
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Event Timing
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllDay}
                  onChange={(e) => setIsAllDay(e.target.checked)}
                  className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-600">All day event</span>
              </label>
            </div>

            {!isAllDay && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  />
                </div>
              </div>
            )}
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
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
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
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Repeat Options
            </label>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={repeatWeekly}
                  onChange={(e) => {
                    setRepeatWeekly(e.target.checked);
                    if (e.target.checked) setRepeatMonthly(false); // Only one at a time
                  }}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-2"
                />
                <span className="text-sm text-gray-900">
                  Repeat Weekly (52 weeks)
                </span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={repeatMonthly}
                  onChange={(e) => {
                    setRepeatMonthly(e.target.checked);
                    if (e.target.checked) setRepeatWeekly(false); // Only one at a time
                  }}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-2"
                />
                <span className="text-sm text-gray-900">
                  Repeat Monthly (12 months)
                </span>
              </label>
            </div>
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
