"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/ui/SideBar/Sidebar";
import Button from "@/components/ui/Button/Button";
import Calendar from "@/components/ui/Calendar/Calendar";
import CreateStep1 from "@/components/Sidebar/CreateStep1";
import CreateStep2 from "@/components/Sidebar/CreateStep2";
import { UserType, EventType } from "@/app/types/types";

export default function CalendarPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState(1);

  const [newDate, setNewDate] = useState("");
  const [newServices, setNewServices] = useState<string[]>([]);
  const [newUser, setNewUser] = useState<UserType | null>(null);
  const [newDesc, setNewDesc] = useState("");

  const services = ["مو", "پوست", "ناخن", "ماساژ", "آرایش"];

  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
    }
    fetchEvents();
  }, []);

  // Fetch users
  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!selectedUser) return events;
    return events.filter((e) => e.extendedProps?.user?.id === selectedUser.id);
  }, [events, selectedUser]);

  async function createEvent() {
    if (!newDate || !newUser) return;
    const newEvent: EventType = {
      id: String(Date.now()),
      title: newUser.name,
      start: newDate,
      color: "#10b981",
      extendedProps: {
        user: newUser,
        description: newDesc,
        services: newServices,
      },
    };
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    setEvents((prev) => [...prev, newEvent]);
    setIsCreateOpen(false);
    setCreateStep(1);
    setNewDate("");
    setNewServices([]);
    setNewUser(null);
    setNewDesc("");
  }

  return (
    <div className="p-6 font-vazir bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateOpen(true)} variant="outline">
            + رزرو جدید
          </Button>
          <select
            className="border rounded px-2 py-1"
            value={selectedUser?.id || ""}
            onChange={(e) => {
              const user = users.find((u) => u.id === e.target.value) || null;
              setSelectedUser(user);
            }}
          >
            <option value="">همه کاربران</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow p-4">
        <Calendar events={filteredEvents} onEventClick={setSelectedEvent} />
      </div>

      <Sidebar isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        {createStep === 1 && (
          <CreateStep1
            newDate={newDate}
            setNewDate={setNewDate}
            newServices={newServices}
            setNewServices={setNewServices}
            services={services}
            onNext={() => setCreateStep(2)}
            onClose={() => setIsCreateOpen(false)}
          />
        )}
        {createStep === 2 && (
          <CreateStep2
            users={users}
            newUser={newUser}
            setNewUser={setNewUser}
            newDesc={newDesc}
            setNewDesc={setNewDesc}
            onPrev={() => setCreateStep(1)}
            onSave={createEvent}
          />
        )}
      </Sidebar>
    </div>
  );
}
