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

  // گروه بندی avatarها بر اساس روز
  const getDayAvatars = () => {
    const map: Record<string, string[]> = {};
    events.forEach((e) => {
      const date = new Date(e.start).toDateString();
      const avatar = e.extendedProps?.user?.avatar;
      if (!avatar) return;
      if (!map[date]) map[date] = [];
      map[date].push(avatar);
    });
    return map;
  };

  // اضافه کردن avatarها روی header هر بار که view تغییر می‌کند یا datesSet می‌شود
  const handleDatesSet = (arg: DatesSetArg) => {
    const dayAvatars = getDayAvatars();
    const headers = document.querySelectorAll(".fc-col-header-cell");

    headers.forEach((header) => {
      const dateStr = header.getAttribute("data-date");
      if (!dateStr) return;

      const avatars = dayAvatars[new Date(dateStr).toDateString()];
      if (!avatars || avatars.length === 0) {
        // اگر قبلاً avatar اضافه شده بود پاک کن
        const existing = header.querySelector(".avatar-header");
        if (existing) existing.remove();
        return;
      }

      // اگر قبلاً avatar اضافه شده بود پاک کن تا دوباره اضافه بشه
      const existing = header.querySelector(".avatar-header");
      if (existing) existing.remove();

      // ایجاد div avatar
      const div = document.createElement("div");
      div.className = "avatar-header flex -space-x-2 justify-center mb-1";

      avatars.slice(0, 3).forEach((av) => {
        const img = document.createElement("img");
        img.src = av;
        img.className = "w-9 h-9 rounded-full border-2 border-white";
        div.appendChild(img);
      });

      const extra = avatars.length - 3;
      if (extra > 0) {
        const extraDiv = document.createElement("div");
        extraDiv.className =
          "w-9 h-9 rounded-full bg-gray-100 font-thin -mr-3 text-xs flex items-center justify-center border-2 border-white";
        extraDiv.innerText = `+${extra}`;
        div.appendChild(extraDiv);
      }

      // اضافه کردن avatar بالای روزها ولی **پایین عنوان روز**
      const titleDiv = header.querySelector(".fc-col-header-cell-cushion");
      if (titleDiv) {
        titleDiv.insertAdjacentElement("afterend", div);
      } else {
        header.prepend(div);
      }
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
