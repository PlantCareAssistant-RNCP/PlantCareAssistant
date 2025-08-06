import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";
import logger from "@utils/logger";

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date | null;
  plantId?: number;
}

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: CalendarEvent;
  onEventUpdated: () => void;
}

// Update the Plant interface to match your actual API response
interface Plant {
  plant_id: number;           
  plant_name: string;         
  PLANT_TYPE?: {              
    plant_type_name: string;
  };
}

const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  onEventUpdated,
}) => {
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [plantId, setPlantId] = useState<number | undefined>(undefined);
  
  const [isAllDay, setIsAllDay] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add state for plants
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoadingPlants, setIsLoadingPlants] = useState(false);

  // Add recurring state
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatMonthly, setRepeatMonthly] = useState(false);

  useEffect(() => {
    if (isOpen && selectedEvent) {
      // Initialize form with current event data
      setTitle(selectedEvent.title);
      const dateStr = selectedEvent.start.toISOString().split('T')[0];
      setDate(dateStr);
      setPlantId(selectedEvent.plantId);
      
      const startDate = new Date(selectedEvent.start);
      const endDate = new Date(selectedEvent.end || selectedEvent.start);
      
      const isCurrentlyAllDay = (
        startDate.getHours() === 0 && 
        startDate.getMinutes() === 0 &&
        endDate.getHours() === 23 && 
        endDate.getMinutes() === 59
      );
      
      setIsAllDay(isCurrentlyAllDay);
      
      if (!isCurrentlyAllDay) {
        const startTimeStr = startDate.toTimeString().slice(0, 5); // "HH:MM"
        const endTimeStr = endDate.toTimeString().slice(0, 5); // "HH:MM"
        setStartTime(startTimeStr);
        setEndTime(endTimeStr);
      } else {
        setStartTime("09:00");
        setEndTime("10:00");
      }
      
      // Initialize recurring state - check if event is already recurring
      // For now, default to false since we're keeping it simple
      setRepeatWeekly(false);
      setRepeatMonthly(false);
      
      setError(null);
    }
  }, [isOpen, selectedEvent]);

  // Add click outside handler
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

  // Add useEffect to fetch plants
  useEffect(() => {
    const fetchPlants = async () => {
      if (!user) return;
      
      try {
        setIsLoadingPlants(true);
        const response = await fetch("/api/plants");
        if (response.ok) {
          const plantsData = await response.json();
          setPlants(plantsData);
        }
      } catch (err) {
        logger.error("Error fetching plants:", err);
      } finally {
        setIsLoadingPlants(false);
      }
    };

    if (isOpen) {
      fetchPlants();
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to update events");
      return;
    }

    if (!title.trim()) {
      setError("Event title is required");
      return;
    }

    if (!date) {
      setError("Event date is required");
      return;
    }

    if (!isAllDay) {
      if (startTime >= endTime) {
        setError("End time must be after start time");
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);

      // Create DateTime objects with proper time handling
      const baseDate = new Date(date);
      const startDateTime = new Date(baseDate);
      const endDateTime = new Date(baseDate);

      if (isAllDay) {
        startDateTime.setHours(0, 0, 0, 0);
        endDateTime.setHours(23, 59, 59, 999);
      } else {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        
        startDateTime.setHours(startHour, startMinute, 0, 0);
        endDateTime.setHours(endHour, endMinute, 0, 0);
      }

      const updateData = {
        title: title.trim(),
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        plantId: plantId || null,  // Change from plant_id to plantId
        repeatWeekly,
        repeatMonthly,
      };

      logger.info("Updating event:", { eventId: selectedEvent.id, updateData });

      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        logger.info("Event updated successfully");
        onEventUpdated(); // Trigger refresh in parent
        onClose(); // Close the modal
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update event");
        logger.error("API error updating event:", errorData);
      }
    } catch (err) {
      logger.error("Error updating event:", err);
      setError("Failed to update event. Please try again.");
    } finally {
      setIsLoading(false);
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
          Edit Event
        </h2>

        {/* Add the form here */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Date *
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="plantId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Plant (Optional)
            </label>
            <select
              id="plantId"
              value={plantId || ""}
              onChange={(e) =>
                setPlantId(e.target.value ? parseInt(e.target.value) : undefined)
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
            >
              <option value="">Select a plant (optional)</option>
              {isLoadingPlants ? (
                <option disabled>Loading plants...</option>
              ) : (
                plants.map((plant) => (
                  <option key={plant.plant_id} value={plant.plant_id}>
                    {plant.plant_name} {plant.PLANT_TYPE ? `(${plant.PLANT_TYPE.plant_type_name})` : ''}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* New fields for time and all-day event */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Time
            </label>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label
                  htmlFor="startTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={isAllDay}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="endTime"
                  className="block text-sm font-medium text-gray-700"
                >
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={isAllDay}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAllDay"
              checked={isAllDay}
              onChange={(e) => setIsAllDay(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isAllDay"
              className="ml-2 block text-sm text-gray-900"
            >
              All-day event
            </label>
          </div>

          {/* Modified recurring options section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Repeat Options
            </label>
            
            <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <strong>Note:</strong> Recurring patterns cannot be changed for existing events. 
              To modify recurring settings, please delete this event and create a new one with your desired pattern.
            </div>
            
            <div className="flex items-center space-x-4">
              <label className="flex items-center opacity-50">
                <input
                  type="checkbox"
                  checked={false}
                  disabled={true}  // Always disabled for editing
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-2"
                />
                <span className="text-sm text-gray-500">Repeat Weekly (52 weeks)</span>
              </label>
              
              <label className="flex items-center opacity-50">
                <input
                  type="checkbox"
                  checked={false}
                  disabled={true}  // Always disabled for editing
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mr-2"
                />
                <span className="text-sm text-gray-500">Repeat Monthly (12 months)</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !title.trim() || !date}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Updating..." : "Update Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventModal;