"use client";

import { useEffect, useState, useMemo } from "react";
import Sidebar from "@/components/ui/SideBar/Sidebar";
import Button from "@/components/ui/Button/Button";
import Calendar from "@/components/ui/Calendar/Calendar";
import { UserType, EventType } from "@/app/types/types";
import CreateEventForm from "@/widgets/CreateEventForm";

export default function CalendarPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [profileUser, setProfileUser] = useState<UserType | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEventOpen, setIsEventOpen] = useState(false); // 🔹 سایدبار ایونت
  const [createStep, setCreateStep] = useState(1);

  const [newDate, setNewDate] = useState("");
  const [newServices, setNewServices] = useState<string[]>([]);
  const [newUser, setNewUser] = useState<UserType | null>(null);
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    async function fetchEvents() {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data);
    }
    fetchEvents();
  }, []);

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

  const handleAvatarClick = (user: UserType) => {
    if (!user) return;
    setProfileUser(user);
    setIsProfileOpen(true);
  };

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event);
    setIsEventOpen(true);
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
        <Calendar
          events={filteredEvents}
          onEventClick={handleEventClick}
          onAvatarClick={handleAvatarClick}
        />
      </div>

      {/* Sidebar برای ساخت ایونت */}
      <Sidebar isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <CreateEventForm
          users={users}
          services={["جراحی بینی", "لیفت صورت", "مساج", "آموزش"]}
          onClose={() => setIsCreateOpen(false)}
          onSave={async (data) => {
            const { date, user, services, desc } = data;
            setNewDate(date);
            setNewUser(user);
            setNewServices(services);
            setNewDesc(desc);
            await createEvent();
          }}
        />
      </Sidebar>

      {/* Sidebar پروفایل کاربر */}
      <Sidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)}>
        {profileUser && (
          <div className="p-4 flex flex-col items-center">
            <img
              src={profileUser.avatar}
              className="w-20 h-20 rounded-full mb-4 border-2 border-gray-300"
            />
            <h2 className="text-xl font-bold">{profileUser.name}</h2>
            <p className="text-gray-500 mt-2">ID: {profileUser.id}</p>
          </div>
        )}
      </Sidebar>

      {/* 🔹 Sidebar جزئیات ایونت */}
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

            {selectedEvent.extendedProps?.user && (
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={selectedEvent.extendedProps.user.avatar}
                  className="w-10 h-10 rounded-full border"
                />
                <span>{selectedEvent.extendedProps.user.name}</span>
              </div>
            )}

            {selectedEvent.extendedProps?.description && (
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">توضیحات:</span>{" "}
                {selectedEvent.extendedProps.description}
              </p>
            )}

            {(() => {
              const services = selectedEvent.extendedProps?.services ?? [];
              return services.length > 0 ? (
                <div className="mt-2">
                  <p className="font-semibold">سرویس‌ها:</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {services.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              ) : null;
            })()}
          </div>
        )}
      </Sidebar>
    </div>
  );
}
