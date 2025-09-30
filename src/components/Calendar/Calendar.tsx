// components/Calendar/Calendar.tsx
"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import faLocale from "@fullcalendar/core/locales/fa";
import { EventType } from "@/app/types/types";
import EventItem from "./EventItem";

interface CalendarProps {
  events: EventType[];
  onEventClick: (ev: EventType) => void;
}

export default function Calendar({ events, onEventClick }: CalendarProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      }}
      initialView="timeGridWeek"
      locales={[faLocale]}
      locale="fa"
      firstDay={6}
      events={events}
      slotMinTime="08:00:00"
      slotMaxTime="20:00:00"
      allDaySlot={false}
      height="auto"
      editable={true}
      slotDuration="00:05:00"
      eventContent={(arg) => <EventItem event={arg.event} />}
      eventClick={(info) => {
        const ev: EventType = {
          id: info.event.id,
          title: info.event.title,
          start: info.event.start?.toISOString() || "",
          color: info.event.backgroundColor,
          extendedProps: info.event.extendedProps,
        };
        onEventClick(ev);
      }}
    />
  );
}
