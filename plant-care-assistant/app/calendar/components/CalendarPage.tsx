import React, { useState, useMemo } from "react";
import { Calendar, luxonLocalizer, Views } from "react-big-calendar";
import { DateTime, Settings } from "luxon";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";


const defaultTZ = DateTime.local().zoneName;

const CalendarPage: React.FC = () => {
  const [timezone, setTimezone] = useState(defaultTZ);

  const { localizer, events, defaultDate, getNow } = useMemo(() => {
    Settings.defaultZone = timezone;

    return {
      localizer: luxonLocalizer(DateTime),
      events: [
        {
          title: "Water Aloe Vera",
          start: DateTime.local().toJSDate(),
          end: DateTime.local().plus({ hours: 1 }).toJSDate(),
        },
      ],
      defaultDate: DateTime.local().toJSDate(),
      getNow: () => DateTime.local().toJSDate(),
    };
  }, [timezone]);

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6 text-green-700">Plant Care Calendar</h1>
      <Calendar
        selectable
        onSelectEvent={(event)=>{
            const action = confirm(`Do you want to delete the event: "${event.title}"?`);
            if(action){
                setEvents((prevEvents)=>prevEvents.filter((e)=>e !== event));
            }
        }}
        onSelectSlot={(slotInfo)=>{
        const title = prompt("Enter event title: ");
        if (title){
            setEvents((prevEvents) => [
                ...prevEvents,
            {title, start: slotInfo.start, end: slotInfo.end,},
        ]);
        }
      }}
        localizer={localizer}
        events={events}
        defaultDate={defaultDate}
        getNow={getNow}
        defaultView={Views.MONTH}
        views={[Views.MONTH, Views.AGENDA]}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default CalendarPage;