"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Sidebar from "@/components/ui/SideBar/Sidebar";
import Button from "@/components/ui/Button/Button";
import MyCalendar from "@/components/ui/Calendar/Calendar";
import CreateEventForm from "@/widgets/CreateEventForm";
import { ToastProvider } from "@/components/ui/Toast/ToastProvider";
import { useToastHelpers } from "@/components/ui/Toast/useToast";
import { Operator, EventType, BlockedDay } from "@/app/types/types";

function CalendarPageContent() {
  const toast = useToastHelpers();
  const [operators, setOperators] = useState<Operator[]>([]);
  const [events, setEvents] = useState<EventType[]>([]);
  const [blockedDays, setBlockedDays] = useState<BlockedDay[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );
  const [operatorSearchQuery, setOperatorSearchQuery] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    async function fetchOperators() {
      const res = await fetch("/api/operators");
      const data = await res.json();
      setOperators(data);
    }
    fetchOperators();
  }, []);

  useEffect(() => {
    async function fetchBlockedDays() {
      const res = await fetch("/api/blocked-days");
      const data = await res.json();
      setBlockedDays(data);
    }
    fetchBlockedDays();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!selectedOperator) return events;
    return events.filter(
      (e) => e.extendedProps.operator.id === selectedOperator.id
    );
  }, [events, selectedOperator]);

  const filteredOperators = useMemo(() => {
    if (!operatorSearchQuery.trim()) return operators;
    return operators.filter(op => 
      op.name.toLowerCase().includes(operatorSearchQuery.toLowerCase()) ||
      op.specialty.toLowerCase().includes(operatorSearchQuery.toLowerCase())
    );
  }, [operators, operatorSearchQuery]);

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event);
    setIsEventOpen(true);
  };

  // Handle adding new event from calendar cell click
  const handleAddEvent = (dateStr: string) => {
    // You can set a default time or open form with pre-filled date
    console.log("Adding event for date:", dateStr);
    setIsCreateOpen(true);
    // TODO: Pass the selected date to the form
  };

  // Handle blocking a day
  const handleBlockDay = async (dateStr: string) => {
    try {
      const res = await fetch("/api/blocked-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr }),
      });
      const data = await res.json();
      
      if (data.success) {
        setBlockedDays(data.blockedDays);
        toast.success(`روز ${new Date(dateStr).toLocaleDateString("fa-IR")} بلاک شد`, {
          title: "روز بلاک شد"
        });
      } else {
        toast.error(data.error || "خطا در بلاک کردن روز", {
          title: "خطا"
        });
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور", {
        title: "خطا"
      });
    }
  };

  const handleEventSave = (newEvent: EventType) => {
    // Add the new event immediately to the events list
    setEvents(prevEvents => [...prevEvents, newEvent]);
    setIsCreateOpen(false);
    
    // Navigate calendar to the booked time
    if (calendarRef.current && newEvent.start) {
      const eventDate = new Date(newEvent.start);
      // Use FullCalendar's gotoDate method
      setTimeout(() => {
        const calendarApi = calendarRef.current.getApi();
        if (calendarApi) {
          calendarApi.gotoDate(eventDate);
          // Switch to week view to show the reservation in context
          calendarApi.changeView('timeGridWeek', eventDate);
        }
      }, 100);
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 font-vazir min-h-screen">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center">
          <Button onClick={() => setIsCreateOpen(true)} variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-lg">+</span>
            رزرو جدید
          </Button>
          
          {/* Simplified Operators Section */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="جستجوی اپراتور..."
              value={operatorSearchQuery}
              onChange={(e) => setOperatorSearchQuery(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
            />
            <Button 
              onClick={() => {
                setSelectedOperator(null);
                setOperatorSearchQuery("");
              }}
              variant="outline"
              className="text-sm whitespace-nowrap"
            >
              همه
            </Button>
          </div>
        </div>
        
        {/* Selected Operator Display */}
        {selectedOperator && (
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <img
              src={selectedOperator.avatar}
              alt={selectedOperator.name}
              className="w-8 h-8 rounded-full border border-white shadow-sm"
            />
            <div className="text-sm">
              <div className="font-medium text-blue-900">{selectedOperator.name}</div>
              <div className="text-xs text-blue-600">{selectedOperator.specialty}</div>
            </div>
            <button
              onClick={() => setSelectedOperator(null)}
              className="text-blue-500 hover:text-blue-700 ml-2"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Operator Selection Dropdown */}
        {operatorSearchQuery && filteredOperators.length > 0 && !selectedOperator && (
          <div className="absolute z-10 mt-12 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto w-full sm:w-80">
            {filteredOperators.map((op) => (
              <div
                key={op.id}
                onClick={() => {
                  setSelectedOperator(op);
                  setOperatorSearchQuery("");
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <img
                  src={op.avatar}
                  alt={op.name}
                  className="w-8 h-8 rounded-full border border-gray-200"
                />
                <div className="text-right">
                  <div className="font-medium text-gray-900 text-sm">{op.name}</div>
                  <div className="text-xs text-gray-500">{op.specialty}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl sm:rounded-2xl shadow p-2 sm:p-4">
        <MyCalendar 
          ref={calendarRef}
          events={filteredEvents} 
          blockedDays={blockedDays}
          onEventClick={handleEventClick}
          onAddEvent={handleAddEvent}
          onBlockDay={handleBlockDay}
        />
      </div>

      {/* Sidebar برای ساخت ایونت */}
      <Sidebar isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <CreateEventForm
          operators={operators}
          events={events}
          blockedDays={blockedDays}
          onSave={handleEventSave}
          onClose={() => setIsCreateOpen(false)}
        />
      </Sidebar>

      {/* Sidebar جزئیات ایونت */}
      <Sidebar isOpen={isEventOpen} onClose={() => setIsEventOpen(false)}>
        {selectedEvent && (
          <div className="p-4">
            <h2 className="text-xl font-bold mb-2">{selectedEvent.title}</h2>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold">شروع:</span>{" "}
              {new Date(selectedEvent.start).toLocaleString("fa-IR")}
            </p>
            {selectedEvent.end && (
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">پایان:</span>{" "}
                {new Date(selectedEvent.end).toLocaleString("fa-IR")}
              </p>
            )}
            <div className="flex items-center gap-2 mb-2">
              <img
                src={selectedEvent.extendedProps.operator.avatar}
                className="w-10 h-10 rounded-full border"
              />
              <span>
                {selectedEvent.extendedProps.operator.name} (
                {selectedEvent.extendedProps.operator.specialty})
              </span>
            </div>
            {selectedEvent.extendedProps.services.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">سرویس‌ها:</p>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedEvent.extendedProps.services.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </Sidebar>
    </div>
  );
}

export default function CalendarPage() {
  return (
    <ToastProvider maxToasts={3} defaultPosition="top-right">
      <CalendarPageContent />
    </ToastProvider>
  );
}
