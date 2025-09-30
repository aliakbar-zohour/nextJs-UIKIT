"use client";

import FullCalendar from "@fullcalendar/react";
import {
  CalendarOptions,
  EventClickArg,
  EventContentArg,
  DatesSetArg,
} from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import faLocale from "@fullcalendar/core/locales/fa";
import { ReactNode } from "react";
import { EventType } from "@/app/types/types";

interface CalendarProps {
  events: EventType[];
  onEventClick?: (event: EventType) => void;
  onAvatarClick?: (user: any) => void; // <-- اضافه شد
  eventContent?: (arg: EventContentArg) => ReactNode;
  initialView?: CalendarOptions["initialView"];
  firstDay?: number;
  slotMinTime?: string;
  slotMaxTime?: string;
  allDaySlot?: boolean;
  editable?: boolean;
  slotDuration?: string;
  headerToolbar?: CalendarOptions["headerToolbar"];
  plugins?: CalendarOptions["plugins"];
  height?: string | number;
  locale?: string;
}

export default function Calendar({
  events,
  onEventClick,
  onAvatarClick,
  eventContent,
  initialView = "timeGridWeek",
  firstDay = 6,
  slotMinTime = "08:00",
  slotMaxTime = "20:00",
  allDaySlot = false,
  editable = true,
  slotDuration = "00:05",
  headerToolbar = {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  plugins = [dayGridPlugin, timeGridPlugin, interactionPlugin],
  height = "auto",
  locale = "fa",
}: CalendarProps) {
  const handleEventClick = (info: EventClickArg) => {
    if (!onEventClick) return;

    const ev = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start?.toISOString() || "",
      end: info.event.end?.toISOString(),
      color: info.event.backgroundColor,
      extendedProps: info.event.extendedProps,
    };

    onEventClick(ev);
  };

  const getDayAvatars = () => {
    const map: Record<string, any[]> = {};
    events.forEach((e) => {
      const date = new Date(e.start).toDateString();
      const avatar = e.extendedProps?.user;
      if (!avatar) return;
      if (!map[date]) map[date] = [];
      map[date].push(avatar);
    });
    return map;
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const dayAvatars = getDayAvatars();
    const headers = document.querySelectorAll(".fc-col-header-cell");

    headers.forEach((header) => {
      const dateStr = header.getAttribute("data-date");
      if (!dateStr) return;

      const avatars = dayAvatars[new Date(dateStr).toDateString()];
      if (!avatars || avatars.length === 0) {
        const existing = header.querySelector(".avatar-header");
        if (existing) existing.remove();
        return;
      }

      const existing = header.querySelector(".avatar-header");
      if (existing) existing.remove();

      const div = document.createElement("div");
      div.className = "avatar-header flex -space-x-2 justify-center mb-1";

      avatars.slice(0, 3).forEach((user) => {
        const img = document.createElement("img");
        img.src = user.avatar;
        img.className =
          "w-9 h-9 rounded-full border-2 border-white cursor-pointer";
        img.title = user.name;
        img.addEventListener("click", () => {
          if (onAvatarClick) onAvatarClick(user);
        });
        div.appendChild(img);
      });

      const extra = avatars.length - 3;
      if (extra > 0) {
        const extraDiv = document.createElement("div");
        extraDiv.className =
          "w-9 h-9 rounded-full bg-gray-100 -mr-3 text-xs flex items-center justify-center border-2 border-white cursor-pointer";
        extraDiv.innerText = `+${extra}`;
        extraDiv.addEventListener("click", () => {
          if (onAvatarClick) onAvatarClick(null);
        });
        div.appendChild(extraDiv);
      }

      const titleDiv = header.querySelector(".fc-col-header-cell-cushion");
      if (titleDiv) titleDiv.insertAdjacentElement("afterend", div);
      else header.prepend(div);
    });
  };

  return (
    <FullCalendar
      plugins={plugins}
      headerToolbar={headerToolbar}
      initialView={initialView}
      locales={[faLocale]}
      locale={locale}
      firstDay={firstDay}
      events={events}
      slotMinTime={slotMinTime}
      slotMaxTime={slotMaxTime}
      allDaySlot={allDaySlot}
      editable={editable}
      slotDuration={slotDuration}
      height={height}
      eventContent={eventContent}
      eventClick={handleEventClick}
      datesSet={handleDatesSet}
    />
  );
}
