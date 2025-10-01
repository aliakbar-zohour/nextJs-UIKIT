"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/ui/SideBar/Sidebar";
import Button from "@/components/ui/Button/Button";
import Calendar from "@/components/ui/Calendar/Calendar";
import { Operator, Event } from "@/lib/mockData";
import CreateEventForm from "@/widgets/CreateEventForm";

export default function CalendarPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);

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

  const filteredEvents = useMemo(() => {
    if (!selectedOperator) return events;
    return events.filter(e => e.extendedProps.operator.id === selectedOperator.id);
  }, [events, selectedOperator]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsEventOpen(true);
  };

  const createEvent = async (newEvent: Event) => {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    const data = await res.json();
    if (data.success) {
      setEvents(data.events);
      setIsCreateOpen(false);
    } else {
      alert(data.error || "خطا در ثبت رزرو");
    }
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
              const op = operators.find(o => o.id === e.target.value) || null;
              setSelectedOperator(op);
            }}
          >
            <option value="">همه اپراتورها</option>
            {operators.map(op => (
              <option key={op.id} value={op.id}>
                {op.name} ({op.specialty})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <Calendar
          events={filteredEvents}
          onEventClick={handleEventClick}
          
        />
      </div>

      {/* Sidebar برای ساخت ایونت */}
      <Sidebar isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <CreateEventForm
          operators={operators}
          events={events}
          onSave={createEvent}
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
              <span>{selectedEvent.extendedProps.operator.name} ({selectedEvent.extendedProps.operator.specialty})</span>
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
