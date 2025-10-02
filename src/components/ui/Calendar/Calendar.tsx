"use client";

import FullCalendar from "@fullcalendar/react";
import {
  CalendarOptions,
  EventClickArg,
  EventContentArg,
  DatesSetArg,
} from "@fullcalendar/core";
import { DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import faLocale from "@fullcalendar/core/locales/fa";
import { ReactNode, useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { EventType, BlockedDay } from "@/app/types/types";
import Dropdown from "../DropDown/DropDown";

interface CalendarProps {
  events: EventType[];
  blockedDays?: BlockedDay[];
  onEventClick?: (event: EventType) => void;
  onAvatarClick?: (user: any) => void;
  onAddEvent?: (date: string) => void;
  onBlockDay?: (date: string) => void;
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

const MyCalendar = forwardRef<any, CalendarProps>(function MyCalendar({
  events,
  blockedDays = [],
  onEventClick,
  onAvatarClick,
  onAddEvent,
  onBlockDay,
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
}: CalendarProps, ref) {
  // State for dropdown management
  const [dropdownState, setDropdownState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    date: string | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    date: null,
  });
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const fullCalendarRef = useRef<FullCalendar>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Expose calendar API through ref
  useImperativeHandle(ref, () => ({
    getApi: () => fullCalendarRef.current?.getApi(),
  }));

  // Handle date cell click to show dropdown
  const handleDateClick = (info: DateClickArg) => {
    const rect = info.jsEvent.target as HTMLElement;
    const calendarRect = calendarRef.current?.getBoundingClientRect();
    
    if (calendarRect) {
      setDropdownState({
        isOpen: true,
        position: {
          x: info.jsEvent.clientX - calendarRect.left,
          y: info.jsEvent.clientY - calendarRect.top,
        },
        date: info.dateStr,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownState.isOpen && calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setDropdownState(prev => ({ ...prev, isOpen: false }));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownState.isOpen]);

  // Update current time every 30 seconds for more accurate display
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(timer);
  }, []);

  // Update time indicator when current time changes
  useEffect(() => {
    const timer = setTimeout(() => {
      addCurrentTimeIndicator();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentTime]);

  // Dropdown menu items
  const dropdownItems = [
    {
      label: "اضافه کردن رویداد",
      value: "add-event",
    },
    {
      label: "بلاک کردن روز",
      value: "block-day",
    },
    {
      label: "اضافه کردن گروه",
      value: "add-group",
    },
  ];

  // Handle dropdown item selection
  const handleDropdownSelect = (item: { label: string; value?: any }) => {
    if (!dropdownState.date || !item.value) return;

    if (item.value === "add-event" && onAddEvent) {
      onAddEvent(dropdownState.date);
    } else if (item.value === "block-day" && onBlockDay) {
      onBlockDay(dropdownState.date);
    } else if (item.value === "add-group") {
      // TODO: Implement add group functionality
      console.log("Add group functionality not implemented yet");
    }

    setDropdownState(prev => ({ ...prev, isOpen: false }));
  };

  const handleEventClick = (info: EventClickArg) => {
    if (!onEventClick) return;

    const ev: EventType = {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start?.toISOString() || "",
      end: info.event.end?.toISOString(),
      color: info.event.backgroundColor || undefined,
      extendedProps: {
        operator: info.event.extendedProps.operator,
        services: info.event.extendedProps.services || [],
        description: info.event.extendedProps.description,
      },
    };

    onEventClick(ev);
  };

  const getDayAvatars = () => {
    const map: Record<string, any[]> = {};
    events.forEach((e) => {
      const date = new Date(e.start).toDateString();
      const avatar = e.extendedProps?.operator;
      if (!avatar) return;
      if (!map[date]) map[date] = [];
      map[date].push(avatar);
    });
    return map;
  };

  const addCurrentTimeIndicator = () => {
    // Remove existing time indicator
    const existingIndicator = document.querySelector('.current-time-indicator');
    if (existingIndicator) {
      existingIndicator.remove();
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Only show time indicator in time grid views and for today
    const timeGridElement = document.querySelector('.fc-timegrid');
    if (!timeGridElement) return;

    // Find today's column
    const todayColumn = document.querySelector(`[data-date="${todayStr}"]`);
    if (!todayColumn) return;

    // Calculate position based on current time
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Calendar starts at 8:00 AM (480 minutes)
    const startMinutes = 8 * 60;
    const endMinutes = 20 * 60; // 8:00 PM
    
    if (totalMinutes < startMinutes || totalMinutes > endMinutes) return;
    
    // Calculate position as percentage
    const workingMinutes = endMinutes - startMinutes;
    const currentWorkingMinutes = totalMinutes - startMinutes;
    const percentage = (currentWorkingMinutes / workingMinutes) * 100;
    
    // Create time indicator line
    const indicator = document.createElement('div');
    indicator.className = 'current-time-indicator';
    indicator.style.cssText = `
      position: absolute;
      top: ${percentage}%;
      left: 0;
      right: 0;
      height: 2px;
      background: #ef4444;
      z-index: 1000;
      pointer-events: none;
    `;
    
    // Add time label badge
    const timeLabel = document.createElement('div');
    timeLabel.className = 'current-time-label';
    timeLabel.textContent = now.toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit',
    });
    timeLabel.style.cssText = `
      position: absolute;
      right: 0;
      top: -14px;
      background: #ef4444;
      color: white;
      padding: 6px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: bold;
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
      border: none;
      z-index: 1001;
      white-space: nowrap;
      font-family: 'Vazir' !important;
    `;
    
    indicator.appendChild(timeLabel);
    
    // Find the time grid content area
    const timeGridContent = document.querySelector('.fc-timegrid-body') as HTMLElement;
    if (timeGridContent) {
      timeGridContent.style.position = 'relative';
      timeGridContent.appendChild(indicator);
    }
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const dayAvatars = getDayAvatars();
    const headers = document.querySelectorAll(".fc-col-header-cell");
    const today = new Date().toDateString();
    
    // Add current time indicator
    setTimeout(() => {
      addCurrentTimeIndicator();
    }, 100);

    headers.forEach((header) => {
      const dateStr = header.getAttribute("data-date");
      if (!dateStr) return;

      const currentDate = new Date(dateStr);
      const currentDateStr = currentDate.toDateString();
      const isToday = currentDateStr === today;
      const isBlocked = blockedDays.some(blocked => blocked.date === dateStr);

      // Remove existing custom elements
      const existing = header.querySelector(".avatar-header");
      if (existing) existing.remove();
      const existingBlocked = header.querySelector(".blocked-indicator");
      if (existingBlocked) existingBlocked.remove();

      // Style today's header with purple background
      if (isToday) {
        header.classList.add("today-header");
        const titleDiv = header.querySelector(".fc-col-header-cell-cushion");
        if (titleDiv) {
          titleDiv.classList.add("today-title");
        }
      } else {
        header.classList.remove("today-header");
        const titleDiv = header.querySelector(".fc-col-header-cell-cushion");
        if (titleDiv) {
          titleDiv.classList.remove("today-title");
        }
      }

      // Add blocked day indicator
      if (isBlocked) {
        const blockedDiv = document.createElement("div");
        blockedDiv.className = "blocked-indicator absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border border-white";
        blockedDiv.title = "روز بلاک شده";
        (header as HTMLElement).style.position = "relative";
        header.appendChild(blockedDiv);
      }

      const avatars = dayAvatars[currentDateStr];
      if (!avatars || avatars.length === 0) return;

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
    <div ref={calendarRef} className="relative">
      <style jsx global>{`
        .today-header {
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%) !important;
          border-radius: 8px !important;
          margin: 2px !important;
        }
        
        .today-title {
          color: white !important;
          font-weight: bold !important;
        }
        
        .fc-col-header-cell.today-header .fc-col-header-cell-cushion {
          color: white !important;
        }
        
        .fc-today {
          background-color: white !important;
        }
        
        .fc-today .fc-daygrid-day-number {
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%) !important;
          color: white !important;
          border-radius: 50% !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-weight: bold !important;
        }
        
        .blocked-indicator {
          z-index: 10;
        }
      `}</style>
      <FullCalendar
        ref={fullCalendarRef}
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
        dateClick={handleDateClick}
        datesSet={handleDatesSet}
      />
      
      {/* Dropdown positioned absolutely */}
      {dropdownState.isOpen && (
        <div
          className="absolute z-50"
          style={{
            left: dropdownState.position.x,
            top: dropdownState.position.y,
          }}
        >
          <Dropdown
            items={dropdownItems}
            onSelect={handleDropdownSelect}
            isOpen={true}
            onClose={() => setDropdownState(prev => ({ ...prev, isOpen: false }))}
          />
        </div>
      )}
    </div>
  );
});

export default MyCalendar;
