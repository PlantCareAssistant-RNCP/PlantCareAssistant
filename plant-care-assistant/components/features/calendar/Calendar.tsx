import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Calendar, luxonLocalizer, Views } from "react-big-calendar";
import { DateTime, Settings } from "luxon";
import { useAuth } from "../../../providers/AuthProvider";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./styles/calendar.css";
import CreateEventModal from "@components/ui/CreateEventModal";
import EventDetailsModal from "@components/ui/EventDetailsModal";

const defaultTZ = DateTime.local().zoneName;

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date | null;
  plantId?: number;
}

const CalendarPage: React.FC = () => {
  const { session } = useAuth();
  // eslint-disable-next-line
  const [timezone, setTimezone] = useState(defaultTZ);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // Function to fetch events from your API
  const fetchEvents = useCallback(async () => {
    console.log("Session check:", {
      hasSession: !!session,
      hasAccessToken: !!session?.access_token,
      tokenLength: session?.access_token?.length,
    });

    if (!session?.access_token) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/events", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("You need to be logged in to view events");
        }
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();

      // Transform the data to match react-big-calendar expectations
      const transformedEvents: CalendarEvent[] = data.map(
        (event: CalendarEvent & { start: string; end: string | null }) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.start),
          end: event.end ? new Date(event.end) : new Date(event.start),
          plantId: event.plantId,
        })
      );

      setEvents(transformedEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Fetch events when component mounts or session changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleNavigate = useCallback((newDate: Date) => {
    setCurrentDate(newDate);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setSelectedDate(null);
  }, []);

  const handleEventCreated = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCloseDetailsModal = useCallback(() => {
    setIsDetailsModalOpen(false);
    setSelectedEvent(null);
  }, []);

  const handleEventDeleted = useCallback(() => {
    fetchEvents();
  }, [fetchEvents]);

  const { localizer, defaultDate, getNow } = useMemo(() => {
    Settings.defaultZone = timezone;

    return {
      localizer: luxonLocalizer(DateTime),
      defaultDate: DateTime.local().toJSDate(),
      getNow: () => DateTime.local().toJSDate(),
    };
  }, [timezone]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-700">
        Plant Care Calendar
      </h1>
      {isLoading && <p className="text-center">Loading events...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      <Calendar
        selectable
        onSelectEvent={(event) => {
          setSelectedEvent(event);
          setIsDetailsModalOpen(true);
        }}
        onSelectSlot={(slotInfo) => {
          setSelectedDate(slotInfo.start);
          setIsCreateModalOpen(true);
        }}
        onNavigate={handleNavigate}
        localizer={localizer}
        events={events}
        defaultDate={defaultDate}
        date={currentDate}
        getNow={getNow}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.AGENDA]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
      {selectedDate && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          selectedDate={selectedDate}
          onEventCreated={handleEventCreated}
        />
      )}
      {selectedEvent && (
        <EventDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          selectedEvent={selectedEvent}
          onEventDeleted={handleEventDeleted}
        />
      )}
    </div>
  );
};

export default CalendarPage;
