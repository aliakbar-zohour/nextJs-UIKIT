"use client";

import { useEffect, useState, useMemo } from "react";
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

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false);

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
  };

  return (
    <div className="p-6 font-vazir min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateOpen(true)} variant="outline">
            + رزرو جدید
          </Button>
          <select
            className="border rounded-lg px-3.5 gap-3 py-1"
            value={selectedOperator?.id || ""}
            onChange={(e) => {
              const op = operators.find((o) => o.id === e.target.value) || null;
              setSelectedOperator(op);
            }}
          >
            <option value="">همه اپراتورها</option>
            {operators.map((op) => (
              <option key={op.id} value={op.id}>
                {op.name} ({op.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <MyCalendar 
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
