"use client";

import FullCalendar from "@fullcalendar/react";
import {
  CalendarOptions,
  EventClickArg,
  EventContentArg,
  DatesSetArg,
  EventDropArg,
} from "@fullcalendar/core";
import { DateClickArg } from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import faLocale from "@fullcalendar/core/locales/fa";
import { ReactNode, useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { EventType, BlockedDay } from "@/app/types/types";
import Dropdown from "../DropDown/DropDown";
import { useCalendarStore } from "@/store/index";
import { useCalendarActions } from "@/store/hooks";

interface CalendarProps {
  events: EventType[];
  blockedDays?: BlockedDay[];
  onEventClick?: (event: EventType) => void;
  onAvatarClick?: (user: any) => void;
  onAddEvent?: (date: string) => void;
  onBlockDay?: (date: string, reason?: string) => void;
  onBlockRange?: (startDate: string, endDate: string, label?: string) => void;
  eventContent?: (arg: EventContentArg) => ReactNode;
  initialView?: CalendarOptions["initialView"];
  firstDay?: number;
  slotMinTime?: string;
  slotMaxTime?: string;
  allDaySlot?: boolean;
  editable?: boolean;
  selectable?: boolean;
  slotDuration?: string;
  headerToolbar?: CalendarOptions["headerToolbar"];
  plugins?: CalendarOptions["plugins"];
  height?: string | number;
  locale?: string;
}

const MyCalendar = forwardRef<any, CalendarProps>(function MyCalendar({
  events: propEvents,
  blockedDays: propBlockedDays = [],
  onEventClick,
  onAvatarClick,
  onAddEvent,
  onBlockDay,
  onBlockRange,
  eventContent,
  initialView = "timeGridWeek",
  firstDay = 6,
  slotMinTime = "08:00",
  slotMaxTime = "20:00",
  allDaySlot = false,
  editable = true,
  selectable = true,
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
  // Use Zustand store
  const { 
    events: storeEvents, 
    blockedDays: storeBlockedDays, 
    setEvents, 
    setBlockedDays,
    updateEvent,
    currentView,
    setCurrentView,
    selectedEvent,
    setSelectedEvent
  } = useCalendarStore();
  
  const { updateEvent: updateEventAPI } = useCalendarActions();
  
  // Always use props - the parent component manages the store
  const events = propEvents;
  const blockedDays = propBlockedDays;
  // State for dropdown management
  const [dropdownState, setDropdownState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    date: string | null;
    selectedRange?: { start: string; end: string } | null;
    showLabelInput?: boolean;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    date: null,
    selectedRange: null,
    showLabelInput: false,
  });

  // State for label input
  const [labelInputState, setLabelInputState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    onSubmit: (label: string) => void;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    onSubmit: () => {},
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
        selectedRange: null,
      });
    }
  };

  // Handle date range selection
  const handleSelect = (selectInfo: any) => {
    const calendarRect = calendarRef.current?.getBoundingClientRect();
    
    if (calendarRect) {
      const startDate = selectInfo.start.toISOString().split('T')[0];
      const endDate = selectInfo.end.toISOString().split('T')[0];
      
      setDropdownState({
        isOpen: true,
        position: {
          x: selectInfo.jsEvent?.clientX - calendarRect.left || 100,
          y: selectInfo.jsEvent?.clientY - calendarRect.top || 100,
        },
        date: startDate,
        selectedRange: { start: startDate, end: endDate },
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

  // Update avatars when events change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateAvatars();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [events]);

  // Update blocked days styling when blockedDays change
  useEffect(() => {
    const timer = setTimeout(() => {
      const dayCells = document.querySelectorAll(".fc-day, .fc-timegrid-col, .fc-daygrid-day");
      console.log('Updating blocked day styling for', dayCells.length, 'cells');
      console.log('Current blocked days:', blockedDays);
      
      dayCells.forEach((cell) => {
        const dateStr = cell.getAttribute("data-date");
        if (!dateStr) return;
        
        const isBlocked = blockedDays.some(blocked => blocked.date === dateStr);
        
        if (isBlocked) {
          cell.classList.add("blocked-day");
          console.log(`Added blocked-day class to ${dateStr}`);
        } else {
          cell.classList.remove("blocked-day");
        }
      });

      // Update headers with blocked indicators
      const headers = document.querySelectorAll(".fc-col-header-cell");
      headers.forEach((header) => {
        const dateStr = header.getAttribute("data-date");
        if (!dateStr) return;

        const isBlocked = blockedDays.some(blocked => blocked.date === dateStr);
        
        // Remove existing blocked indicator
        const existingBlocked = header.querySelector(".blocked-indicator");
        if (existingBlocked) existingBlocked.remove();

        // Add blocked day indicator
        if (isBlocked) {
          const blockedDiv = document.createElement("div");
          blockedDiv.className = "blocked-indicator";
          blockedDiv.title = "روز بلاک شده";
          (header as HTMLElement).style.position = "relative";
          header.appendChild(blockedDiv);
        }
      });
    }, 200);
    
    return () => clearTimeout(timer);
  }, [blockedDays]);

  // Dropdown menu items
  const getDropdownItems = () => {
    const baseItems = [
      {
        label: "اضافه کردن رویداد",
        value: "add-event",
      },
      {
        label: "اضافه کردن گروه",
        value: "add-group",
      },
    ];

    if (dropdownState.selectedRange) {
      baseItems.push({
        label: "بلاک کردن بازه زمانی",
        value: "block-range",
      });
    } else {
      baseItems.push({
        label: "بلاک کردن روز",
        value: "block-day",
      });
    }

    return baseItems;
  };

  // Block label options
  const getBlockLabelItems = () => [
    { label: "تعطیلات", value: "تعطیلات" },
    { label: "مرخصی", value: "مرخصی" },
    { label: "تعمیرات", value: "تعمیرات" },
    { label: "جلسه", value: "جلسه" },
    { label: "غیرفعال", value: "غیرفعال" },
    { label: "سایر", value: "custom" },
  ];

  // Handle dropdown item selection
  const handleDropdownSelect = (item: { label: string; value?: any }) => {
    if (!dropdownState.date || !item.value) return;

    if (item.value === "add-event" && onAddEvent) {
      onAddEvent(dropdownState.date);
      setDropdownState(prev => ({ ...prev, isOpen: false }));
    } else if (item.value === "block-day" && onBlockDay) {
      // Show label selection dropdown
      setLabelInputState({
        isOpen: true,
        position: dropdownState.position,
        onSubmit: (label: string) => {
          onBlockDay(dropdownState.date!, label);
          setLabelInputState(prev => ({ ...prev, isOpen: false }));
        }
      });
      setDropdownState(prev => ({ ...prev, isOpen: false }));
    } else if (item.value === "block-range" && onBlockRange && dropdownState.selectedRange) {
      // Show label selection dropdown for range
      setLabelInputState({
        isOpen: true,
        position: dropdownState.position,
        onSubmit: (label: string) => {
          onBlockRange(dropdownState.selectedRange!.start, dropdownState.selectedRange!.end, label);
          setLabelInputState(prev => ({ ...prev, isOpen: false }));
        }
      });
      setDropdownState(prev => ({ ...prev, isOpen: false }));
    } else if (item.value === "add-group") {
      // TODO: Implement add group functionality
      console.log("Add group functionality not implemented yet");
      setDropdownState(prev => ({ ...prev, isOpen: false }));
    }
  };

  // Handle block label selection
  const handleBlockLabelSelect = (item: { label: string; value?: any }) => {
    if (item.value === "custom") {
      // For custom label, show text input
      const customLabel = prompt("لیبل دلخواه خود را وارد کنید:");
      if (customLabel !== null && customLabel.trim()) {
        labelInputState.onSubmit(customLabel.trim());
      }
    } else if (item.value) {
      labelInputState.onSubmit(item.value);
    }
    setLabelInputState(prev => ({ ...prev, isOpen: false }));
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
    const timeLabel = document.createElement('h3');
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
      font-family: 'YekanBakh', 'Tahoma', sans-serif !important;
    `;
    
    indicator.appendChild(timeLabel);
    
    // Find the time grid content area
    const timeGridContent = document.querySelector('.fc-timegrid-body') as HTMLElement;
    if (timeGridContent) {
      timeGridContent.style.position = 'relative';
      timeGridContent.appendChild(indicator);
    }
  };

  const updateAvatars = () => {
    // Use a small delay to ensure DOM is updated
    requestAnimationFrame(() => {
      const dayAvatars = getDayAvatars();
      const headers = document.querySelectorAll(".fc-col-header-cell");
      const today = new Date().toDateString();

      headers.forEach((header) => {
        const dateStr = header.getAttribute("data-date");
        if (!dateStr) return;

        const currentDate = new Date(dateStr);
        const currentDateStr = currentDate.toDateString();

        // Remove existing avatar elements
        const existing = header.querySelector(".avatar-header");
        if (existing) existing.remove();

        const avatars = dayAvatars[currentDateStr];
        if (!avatars || avatars.length === 0) return;

        const div = document.createElement("div");
        div.className = "avatar-header flex -space-x-2 justify-center mb-1";

        // Create unique avatars (remove duplicates)
        const uniqueAvatars = avatars.filter((avatar, index, self) => 
          index === self.findIndex(a => a.id === avatar.id)
        );

        uniqueAvatars.slice(0, 3).forEach((user) => {
          const img = document.createElement("img");
          img.src = user.avatar;
          img.className =
            "w-9 h-9 rounded-full border-2 border-white cursor-pointer transition-all duration-200 hover:scale-110";
          img.title = user.name;
          img.addEventListener("click", () => {
            if (onAvatarClick) onAvatarClick(user);
          });
          div.appendChild(img);
        });

        const extra = uniqueAvatars.length - 3;
        if (extra > 0) {
          const extraDiv = document.createElement("div");
          extraDiv.className =
            "w-9 h-9 rounded-full bg-gray-100 -mr-3 text-xs flex items-center justify-center border-2 border-white cursor-pointer transition-all duration-200 hover:scale-110";
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
    });
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    const headers = document.querySelectorAll(".fc-col-header-cell");
    const today = new Date().toDateString();
    const todayDateStr = new Date().toISOString().split('T')[0];
    
    // Add current time indicator
    setTimeout(() => {
      addCurrentTimeIndicator();
    }, 100);

    // Apply blocked day styling to calendar cells
    setTimeout(() => {
      const dayCells = document.querySelectorAll(".fc-day, .fc-timegrid-col, .fc-daygrid-day");
      console.log('Applying blocked day styling to', dayCells.length, 'cells');
      console.log('Blocked days:', blockedDays);
      
      dayCells.forEach((cell) => {
        const dateStr = cell.getAttribute("data-date");
        if (!dateStr) return;
        
        const isBlocked = blockedDays.some(blocked => blocked.date === dateStr);
        console.log(`Cell ${dateStr}: blocked = ${isBlocked}`);
        
        if (isBlocked) {
          cell.classList.add("blocked-day");
          console.log(`Added blocked-day class to ${dateStr}`);
        } else {
          cell.classList.remove("blocked-day");
        }
      });
    }, 300);

    // Style time column header for today
    setTimeout(() => {
      const timeHeaders = document.querySelectorAll(".fc-timegrid-axis");
      timeHeaders.forEach((timeHeader) => {
        // Check if this is today's time column by looking at adjacent columns
        const nextSibling = timeHeader.nextElementSibling;
        if (nextSibling && nextSibling.getAttribute("data-date") === todayDateStr) {
          timeHeader.classList.add("today-time-header");
        } else {
          timeHeader.classList.remove("today-time-header");
        }
      });
    }, 250);

    // Update avatars
    setTimeout(() => {
      updateAvatars();
    }, 300);

    headers.forEach((header) => {
      const dateStr = header.getAttribute("data-date");
      if (!dateStr) return;

      const currentDate = new Date(dateStr);
      const currentDateStr = currentDate.toDateString();
      const isToday = currentDateStr === today;
      const isBlocked = blockedDays.some(blocked => blocked.date === dateStr);

      // Remove existing blocked indicator
      const existingBlocked = header.querySelector(".blocked-indicator");
      if (existingBlocked) existingBlocked.remove();

      // Style today's header with purple border and color
      if (isToday) {
        header.classList.add("today-header");
        const titleDiv = header.querySelector(".fc-col-header-cell-cushion");
        if (titleDiv) {
          titleDiv.classList.add("today-title");
        }
        console.log(`Applied today styling to header for ${dateStr}`);
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
    });
  };

  return (
    <div ref={calendarRef} className="relative">
      <style jsx global>{`
        /* Today's column header styling */
        .fc-col-header-cell.today-header {
          background: #8b5cf6 !important;
          border-radius: 8px !important;
          margin: 2px !important;
          border: none !important;
          margin-bottom: 10px !important;
        }
        
        .fc-col-header-cell.today-header .fc-col-header-cell-cushion {
          color: white !important;
          font-weight: bold !important;
        }

        /* Style the time column header for today */
        .fc-timegrid-axis.today-time-header {
          background: #8b5cf6 !important;
          color: white !important;
          border-radius: 8px !important;
          margin: 2px !important;
        }

        .fc-timegrid-axis.today-time-header .fc-timegrid-axis-cushion {
          color: white !important;
          font-weight: bold !important;
        }

        /* Today's date number in month view */
        .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background: #8b5cf6 !important;
          color: white !important;
          border-radius: 50% !important;
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-weight: bold !important;
          margin: 4px !important;
        }

        /* Today's column background in time grid */
        .fc-timegrid-col.fc-day-today {
          background: rgba(139, 92, 246, 0.05) !important;
        }
        
        .fc-today {
          background-color: transparent !important;
        }
        
        .fc-timegrid-col.fc-today {
          background-color: transparent !important;
        }
        
        .fc-daygrid-day.fc-today {
          background-color: transparent !important;
        }
        
        .fc-today-button {
          background-color: #8b5cf6 !important;
          color: white !important;
          border: 1px solid #8b5cf6 !important;
          border-radius: 6px !important;
          padding: 6px 12px !important;
          font-weight: 500 !important;
        }
        
        .fc-today-button:hover {
          background-color: #7c3aed !important;
          border-color: #7c3aed !important;
        }
        
        .fc-today-button:focus {
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
        }
        
        /* Style other toolbar buttons to match */
        .fc-button-primary {
          background-color: #8b5cf6 !important;
          border-color: #8b5cf6 !important;
          color: white !important;
        }
        
        .fc-button-primary:hover {
          background-color: #7c3aed !important;
          border-color: #7c3aed !important;
        }
        
        .fc-button-primary:focus {
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
        }
        
        .fc-button-primary:disabled {
          background-color: #d1d5db !important;
          border-color: #d1d5db !important;
          color: #6b7280 !important;
        }
        
        /* Remove any yellow/amber backgrounds from today */
        .fc-day-today, .fc-today, .fc-timegrid-col-bg.fc-today {
          background-color: transparent !important;
          background: transparent !important;
        }
        
        .fc-today .fc-daygrid-day-number {
          color: white !important;
          background: #8b5cf6 !important;
          border: none !important;
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
        
        /* Blocked day styling */
        .fc-day.blocked-day,
        .fc-timegrid-col.blocked-day {
          background: repeating-linear-gradient(
            45deg,
            #fee2e2,
            #fee2e2 10px,
            #fecaca 10px,
            #fecaca 20px
          ) !important;
          position: relative !important;
        }
        
        .fc-day.blocked-day::before,
        .fc-timegrid-col.blocked-day::before {
          content: "🚫";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          z-index: 10;
          pointer-events: none;
        }
        
        /* Prevent events on blocked days */
        .blocked-day .fc-event {
          display: none !important;
        }
        
        /* Blocked day indicator in header */
        .blocked-indicator {
          position: absolute !important;
          top: 4px !important;
          right: 4px !important;
          width: 12px !important;
          height: 12px !important;
          background: #ef4444 !important;
          border-radius: 50% !important;
          border: 2px solid white !important;
          z-index: 10 !important;
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
        select={handleSelect}
        selectable={selectable}
        eventDrop={(info: EventDropArg) => {
          // Update event in store
          const updatedEvent: Partial<EventType> = {
            start: info.event.start?.toISOString() || "",
            end: info.event.end?.toISOString(),
          };
          
          updateEvent(info.event.id, updatedEvent);
          
          // Update API
          if (updateEventAPI) {
            updateEventAPI(info.event.id, updatedEvent);
          }
          
          // Update avatars after event is dropped
          setTimeout(() => {
            updateAvatars();
          }, 100);
        }}
        eventResize={(info: any) => {
          // Update event in store
          const updatedEvent: Partial<EventType> = {
            start: info.event.start?.toISOString() || "",
            end: info.event.end?.toISOString(),
          };
          
          updateEvent(info.event.id, updatedEvent);
          
          // Update API
          if (updateEventAPI) {
            updateEventAPI(info.event.id, updatedEvent);
          }
          
          // Update avatars after event is resized
          setTimeout(() => {
            updateAvatars();
          }, 100);
        }}
        eventAllow={(dropInfo, draggedEvent) => {
          // Prevent dropping events on blocked days
          const dropDate = dropInfo.start.toISOString().split('T')[0];
          const isBlocked = blockedDays.some(blocked => blocked.date === dropDate);
          
          if (isBlocked) return false;
          
          // Check for overlapping events
          const newStart = dropInfo.start;
          const newEnd = dropInfo.end || new Date(newStart.getTime() + 60 * 60 * 1000); // Default 1 hour if no end
          
          const hasOverlap = events.some(event => {
            if (draggedEvent && event.id === draggedEvent.id) return false; // Skip the event being moved
            
            const eventStart = new Date(event.start);
            const eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 60 * 60 * 1000);
            
            // Check if times overlap
            return (newStart < eventEnd && newEnd > eventStart);
          });
          
          return !hasOverlap;
        }}
        selectAllow={(selectInfo) => {
          // Prevent selecting blocked days
          const selectDate = selectInfo.start.toISOString().split('T')[0];
          const isBlocked = blockedDays.some(blocked => blocked.date === selectDate);
          
          if (isBlocked) return false;
          
          // Check for overlapping events during selection
          const selectionStart = selectInfo.start;
          const selectionEnd = selectInfo.end;
          
          const hasOverlap = events.some(event => {
            const eventStart = new Date(event.start);
            const eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 60 * 60 * 1000);
            
            // Check if selection overlaps with existing events
            return (selectionStart < eventEnd && selectionEnd > eventStart);
          });
          
          return !hasOverlap;
        }}
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
            items={getDropdownItems()}
            onSelect={handleDropdownSelect}
            isOpen={true}
            onClose={() => setDropdownState(prev => ({ ...prev, isOpen: false }))}
          />
        </div>
      )}

      {/* Label selection dropdown */}
      {labelInputState.isOpen && (
        <div
          className="absolute z-50"
          style={{
            left: labelInputState.position.x,
            top: labelInputState.position.y,
          }}
        >
          <Dropdown
            items={getBlockLabelItems()}
            onSelect={handleBlockLabelSelect}
            isOpen={true}
            onClose={() => setLabelInputState(prev => ({ ...prev, isOpen: false }))}
          />
        </div>
      )}
    </div>
  );
});

export default MyCalendar;
