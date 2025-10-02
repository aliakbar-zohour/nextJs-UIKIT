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
    updateEvent
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
    const now = new Date();
    const clickedDate = new Date(info.date);
    
    // Prevent interaction with past dates
    if (clickedDate < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
      return; // Don't show dropdown for past dates
    }
    
    // For today, check if the clicked time is in the past
    if (clickedDate.toDateString() === now.toDateString()) {
      const clickedTime = clickedDate.getTime();
      if (clickedTime < now.getTime()) {
        return; // Don't show dropdown for past times today
      }
    }
    
    // const rect = info.jsEvent.target as HTMLElement;
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
    const now = new Date();
    const selectionStart = new Date(selectInfo.start);
    
    // Prevent selection of past dates/times
    if (selectionStart < now) {
      return; // Don't allow selection of past times
    }
    
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
      scrollToCurrentTime(); // Always scroll to current time when time updates
      markPastTimeSlots(); // Update past time marking
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentTime]);

  // Update avatars when events change
  useEffect(() => {
    const timer = setTimeout(() => {
      updateAvatars();
      markPastTimeSlots(); // Also update past time slots when events change
    }, 100);
    
    return () => clearTimeout(timer);
  }, [events]);

  // Auto-scroll to current time on initial load
  useEffect(() => {
    const initialScrollTimer = setTimeout(() => {
      // Wait for calendar to be fully rendered
      const timeGridElement = document.querySelector('.fc-timegrid');
      if (timeGridElement) {
        scrollToCurrentTime();
        addCurrentTimeIndicator();
        markPastTimeSlots();
      } else {
        // If not ready yet, try again after a longer delay
        setTimeout(() => {
          scrollToCurrentTime();
          addCurrentTimeIndicator();
          markPastTimeSlots();
        }, 500);
      }
    }, 200);

    return () => clearTimeout(initialScrollTimer);
  }, []); // Empty dependency array means this runs only once on mount

  // Additional effect to ensure scroll happens when calendar is fully ready
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const timeGridElement = document.querySelector('.fc-timegrid');
      const scrollContainer = document.querySelector('.fc-scroller');
      
      if (timeGridElement && scrollContainer) {
        // Calendar is ready, scroll to current time
        setTimeout(() => {
          scrollToCurrentTime();
          addCurrentTimeIndicator();
          markPastTimeSlots();
        }, 100);
        
        // Disconnect observer after first successful scroll
        observer.disconnect();
      }
    });

    // Start observing changes to the calendar container
    const calendarContainer = calendarRef.current;
    if (calendarContainer) {
      observer.observe(calendarContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class']
      });
    }

    // Cleanup observer after 5 seconds to prevent memory leaks
    const cleanup = setTimeout(() => {
      observer.disconnect();
    }, 5000);

    return () => {
      observer.disconnect();
      clearTimeout(cleanup);
    };
  }, []);

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

    // Check if this is a past event and prevent interaction
    const now = new Date();
    const eventStart = info.event.start;
    const eventEnd = info.event.end;
    
    if (eventStart) {
      const todayStr = now.toISOString().split('T')[0];
      const eventDateStr = eventStart.toISOString().split('T')[0];
      
      // For today's events, check if they're in the past
      if (eventDateStr === todayStr) {
        const eventEndTime = eventEnd || new Date(eventStart.getTime() + 60 * 60 * 1000);
        if (eventEndTime <= now) {
          // This is a past event on today - don't allow interaction
          return;
        }
      }
      // For past dates, don't allow interaction
      else if (new Date(eventDateStr) < new Date(todayStr)) {
        return;
      }
    }

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

  const scrollToCurrentTime = () => {
    const now = new Date();
    
    // Always scroll to current time in time grid views
    const timeGridElement = document.querySelector('.fc-timegrid');
    if (!timeGridElement) {
      // If not found, try again after a short delay
      setTimeout(() => scrollToCurrentTime(), 100);
      return;
    }

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // Calendar starts at 8:00 AM (480 minutes)
    const startMinutes = 8 * 60;
    const endMinutes = 20 * 60; // 8:00 PM
    
    // Always scroll to current time, even if outside working hours
    const scrollToMinutes = totalMinutes;
    
    // Calculate scroll position
    const workingMinutes = endMinutes - startMinutes;
    const targetWorkingMinutes = Math.max(0, scrollToMinutes - startMinutes);
    const percentage = Math.max(0, Math.min(100, (targetWorkingMinutes / workingMinutes) * 100));
    
    // Find scrollable container - try multiple selectors in order of preference
    const scrollSelectors = [
      '.fc-timegrid-body .fc-scroller',
      '.fc-scroller-liquid-absolute',
      '.fc-timegrid-body',
      '.fc-scroller',
      '.fc-view-harness-active .fc-scroller',
      '.fc-view-harness .fc-scroller'
    ];
    
    let scrollContainer: HTMLElement | null = null;
    for (const selector of scrollSelectors) {
      scrollContainer = document.querySelector(selector) as HTMLElement;
      if (scrollContainer) break;
    }
    
    const timeGridSlots = document.querySelector('.fc-timegrid-slots') as HTMLElement;
    
    if (scrollContainer && timeGridSlots) {
      const containerHeight = scrollContainer.clientHeight;
      const slotsHeight = timeGridSlots.scrollHeight;
      
      // Position the red line in the upper third of the visible area for better context
      const scrollTop = (percentage / 100) * slotsHeight - (containerHeight / 3);
      
      // Multiple scroll attempts for better reliability
      const finalScrollTop = Math.max(0, scrollTop);
      
      // Immediate scroll
      scrollContainer.scrollTop = finalScrollTop;
      
      // Smooth scroll after a short delay
      setTimeout(() => {
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: finalScrollTop,
            behavior: 'smooth'
          });
        }
      }, 50);
      
      // Final backup scroll
      setTimeout(() => {
        if (scrollContainer) {
          scrollContainer.scrollTop = finalScrollTop;
        }
      }, 200);
      
      console.log(`Scrolled to current time: ${hours}:${minutes.toString().padStart(2, '0')}, scroll position: ${finalScrollTop}`);
    } else {
      console.log('Could not find scroll container or time grid slots');
      // Try again after DOM is more likely to be ready
      setTimeout(() => scrollToCurrentTime(), 200);
    }
  };

  const markPastTimeSlots = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    // Only apply to time grid views
    const timeGridElement = document.querySelector('.fc-timegrid');
    if (!timeGridElement) return;

    // Clear all existing past-time classes
    document.querySelectorAll('.past-time-slot, .past-time-area, .past-event').forEach(el => {
      el.classList.remove('past-time-slot', 'past-time-area', 'past-event');
    });

    // Mark past dates (entire columns for dates before today)
    const allColumns = document.querySelectorAll('[data-date]');
    allColumns.forEach(column => {
      const dateStr = column.getAttribute('data-date');
      if (!dateStr) return;
      
      const columnDate = new Date(dateStr);
      const today = new Date(todayStr);
      
      // If this column is for a past date, mark entire column as past
      if (columnDate < today) {
        column.classList.add('past-time-area');
        // Also mark all child elements
        const childSlots = column.querySelectorAll('.fc-timegrid-slot, .fc-timegrid-slot-lane, .fc-daygrid-day-frame');
        childSlots.forEach(slot => slot.classList.add('past-time-slot'));
      }
    });

    // For today's column, mark only past time slots
    const todayColumn = document.querySelector(`[data-date="${todayStr}"]`);
    if (todayColumn) {
      // Find all time-related elements in today's column
      const timeElements = todayColumn.querySelectorAll('.fc-timegrid-slot, .fc-timegrid-slot-lane, .fc-timegrid-col-events, .fc-timegrid-col-bg');
      
      timeElements.forEach((element) => {
        const slotElement = element as HTMLElement;
        
        // Calculate time based on position within the day column
        const slotRect = slotElement.getBoundingClientRect();
        const columnRect = todayColumn.getBoundingClientRect();
        const relativeTop = Math.max(0, slotRect.top - columnRect.top);
        const columnHeight = columnRect.height;
        
        if (columnHeight > 0) {
          // Map position to time (8 AM to 8 PM = 12 hours = 720 minutes)
          const timePercentage = relativeTop / columnHeight;
          const slotMinutes = (timePercentage * 720) + (8 * 60); // Start from 8 AM
          
          // Mark as past if the slot time is before current time
          if (slotMinutes < currentTotalMinutes) {
            slotElement.classList.add('past-time-slot');
          }
        }
      });

      // Mark past events in today's column
      const todayEvents = todayColumn.querySelectorAll('.fc-event');
      todayEvents.forEach((eventElement) => {
        const eventEl = eventElement as HTMLElement;
        
        // Try to get event data from FullCalendar
        const fcEvent = (eventEl as any).fcSeg?.event;
        if (fcEvent && fcEvent.start) {
          const eventStart = new Date(fcEvent.start);
          const eventEnd = fcEvent.end ? new Date(fcEvent.end) : new Date(eventStart.getTime() + 60 * 60 * 1000);
          
          // If event ends before current time, mark as past
          if (eventEnd <= now) {
            eventEl.classList.add('past-event');
          }
        } else {
          // Fallback: calculate based on position
          const eventRect = eventEl.getBoundingClientRect();
          const columnRect = todayColumn.getBoundingClientRect();
          const relativeTop = Math.max(0, eventRect.top - columnRect.top);
          const columnHeight = columnRect.height;
          
          if (columnHeight > 0) {
            const timePercentage = relativeTop / columnHeight;
            const eventMinutes = (timePercentage * 720) + (8 * 60);
            
            if (eventMinutes < currentTotalMinutes) {
              eventEl.classList.add('past-event');
            }
          }
        }
      });
    }
  };

  const updateAvatars = () => {
    // Use a small delay to ensure DOM is updated
    requestAnimationFrame(() => {
      const dayAvatars = getDayAvatars();
      const headers = document.querySelectorAll(".fc-col-header-cell");

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

  const handleDatesSet = () => {
    const headers = document.querySelectorAll(".fc-col-header-cell");
    const today = new Date().toDateString();
    const todayDateStr = new Date().toISOString().split('T')[0];
    
    // Add current time indicator
    setTimeout(() => {
      addCurrentTimeIndicator();
    }, 100);

    // Auto-scroll to current time - always scroll to ensure proper positioning
    setTimeout(() => {
      scrollToCurrentTime();
    }, 200);
    
    // Additional scroll attempt for better reliability
    setTimeout(() => {
      scrollToCurrentTime();
    }, 500);

    // Mark past time slots
    setTimeout(() => {
      markPastTimeSlots();
    }, 250);

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
        
        /* Past time slots and areas styling */
        .past-time-slot {
          background: rgba(0, 0, 0, 0.05) !important;
          opacity: 0.4 !important;
          pointer-events: none !important;
          position: relative !important;
        }
        
        .past-time-area {
          background: rgba(0, 0, 0, 0.03) !important;
          opacity: 0.5 !important;
          pointer-events: none !important;
        }
        
        .past-time-slot::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.15);
          pointer-events: none;
          z-index: 1;
        }
        
        /* Disable events in past areas */
        .past-time-area .fc-event,
        .past-time-slot .fc-event {
          opacity: 0.3 !important;
          pointer-events: none !important;
        }
        
        /* Disable past events specifically (for today's past events) */
        .past-event {
          opacity: 0.4 !important;
          pointer-events: none !important;
          filter: grayscale(50%) !important;
          position: relative !important;
        }
        
        .past-event::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.2);
          pointer-events: none;
          z-index: 1;
        }
        
        /* Disable interactions with past time headers */
        .past-time-area .fc-col-header-cell {
          opacity: 0.5 !important;
          pointer-events: none !important;
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
          const now = new Date();
          
          // Prevent dropping events in the past
          if (dropInfo.start < now) return false;
          
          // Prevent dropping events on blocked days
          const dropDate = dropInfo.start.toISOString().split('T')[0];
          const isBlocked = blockedDays.some(blocked => blocked.date === dropDate);
          
          if (isBlocked) return false;
          
          // Check for overlapping events - ULTRA strict overlap detection
          const newStart = dropInfo.start;
          const newEnd = dropInfo.end || new Date(newStart.getTime() + 60 * 60 * 1000); // Default 1 hour if no end
          
          const hasOverlap = events.some(event => {
            if (draggedEvent && event.id === draggedEvent.id) return false; // Skip the event being moved
            
            const eventStart = new Date(event.start);
            const eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 60 * 60 * 1000);
            
            // ULTRA strict overlap check - even 1 minute overlap is not allowed
            // Two events overlap if: start1 < end2 AND start2 < end1
            return (newStart.getTime() < eventEnd.getTime() && eventStart.getTime() < newEnd.getTime());
          });
          
          return !hasOverlap;
        }}
        selectAllow={(selectInfo) => {
          const now = new Date();
          
          // Prevent selecting past times
          if (selectInfo.start < now) return false;
          
          // Prevent selecting blocked days
          const selectDate = selectInfo.start.toISOString().split('T')[0];
          const isBlocked = blockedDays.some(blocked => blocked.date === selectDate);
          
          if (isBlocked) return false;
          
          // Check for overlapping events during selection - ULTRA strict
          const selectionStart = selectInfo.start;
          const selectionEnd = selectInfo.end;
          
          const hasOverlap = events.some(event => {
            const eventStart = new Date(event.start);
            const eventEnd = event.end ? new Date(event.end) : new Date(eventStart.getTime() + 60 * 60 * 1000);
            
            // ULTRA strict overlap check - even 1 minute overlap is not allowed
            return (selectionStart.getTime() < eventEnd.getTime() && eventStart.getTime() < selectionEnd.getTime());
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
