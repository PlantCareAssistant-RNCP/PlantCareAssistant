import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../providers/AuthProvider";
import logger from "@utils/logger"

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date | null;
  plantId?: number;
}

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEvent: CalendarEvent;
  onEventDeleted: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  selectedEvent,
  onEventDeleted,
}) => {
  const { user } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);

  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

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
      setError(null);
      setShowConfirmation(false);
      setIsDeleting(false);
    }
  }, [isOpen]);

  const handleDeleteClick = () => {
    setShowConfirmation(true);
    setError(null); // Clear any previous errors
  };

  // Handle actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (!user) {
      setError("You must be logged in to delete events");
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      const response = await fetch(`/api/events/${selectedEvent.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        onEventDeleted();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete event");
      }
    } catch (err) {
      logger.error("Error deleting event:", err);
      setError("Failed to delete event. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl"
      >
        <h2 className="text-2xl font-bold text-green-700 mb-4">
          Event Details
        </h2>

        {/* Event Information Display */}
        <div className="space-y-3 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <div className="p-2 bg-gray-100 rounded border text-gray-700">
              {selectedEvent.title}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="p-2 bg-gray-100 rounded border text-gray-700">
              {selectedEvent.start.toLocaleDateString()}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plant
            </label>
            <div className="p-2 bg-gray-100 rounded border text-gray-700">
              {selectedEvent.plantId
                ? `Plant ID: ${selectedEvent.plantId}`
                : "No specific plant"}
            </div>
          </div>
        </div>

        {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

        {!showConfirmation ? (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete Event
            </button>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800 font-medium mb-3">
              Are you sure you want to delete this event?
            </p>
            <p className="text-red-600 text-sm mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsModal;
