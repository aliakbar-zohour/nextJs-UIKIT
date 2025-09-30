'use client';

import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import faLocale from "@fullcalendar/core/locales/fa";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import Dialog from "@/components/ui/Dialog/Dialog";

interface UserType {
  id: string;
  name: string;
  avatar: string;
}

interface EventType {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
  display?: string;
  extendedProps?: {
    user?: UserType;
    description?: string;
  };
}

export default function CalendarPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUser, setNewUser] = useState("");
  const [newStart, setNewStart] = useState("");
  const [newEnd, setNewEnd] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [filterUser, setFilterUser] = useState<string>("all");

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

  async function saveEvent() {
    if (!selectedEvent) return;
    const updated = { ...selectedEvent, title: editTitle };
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    setEvents((prev) =>
      prev.map((ev) => (ev.id === updated.id ? updated : ev))
    );
    setSelectedEvent(updated);
    setIsEditing(false);
  }

  async function deleteEvent() {
    if (!selectedEvent) return;
    await fetch("/api/events", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedEvent.id }),
    });
    setEvents((prev) => prev.filter((ev) => ev.id !== selectedEvent.id));
    setSelectedEvent(null);
  }

  async function createEvent() {
    if (!newUser || !newStart || !newEnd) return;

    // محدودیت یک روز
    const startDate = new Date(newStart);
    const endDate = new Date(newEnd);
    const diff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 1) {
      alert("حداکثر مدت رزرو یک روز است");
      return;
    }

    const user = users.find((u) => u.id === newUser);
    const newEvent: EventType = {
      id: String(Date.now()),
      title: user ? user.name : "رزرو",
      start: newStart,
      end: newEnd,
      color: "#10b981",
      extendedProps: {
        user,
        description: newDesc,
      },
    };
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newEvent),
    });
    setEvents((prev) => [...prev, newEvent]);
    setIsCreateOpen(false);
    setNewUser("");
    setNewStart("");
    setNewEnd("");
    setNewDesc("");
  }

  const filteredEvents =
    filterUser === "all"
      ? events
      : events.filter((ev) => ev.extendedProps?.user?.id === filterUser);

  return (
    <div className="p-6 font-vazir bg-gray-50 min-h-screen">
      {/* هدر و فیلتر */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
        >
          + رزرو جدید
        </button>

        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="px-3 py-2 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-green-400 outline-none"
        >
          <option value="all">همه کاربران</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* کلندر */}
      <div className="bg-white rounded-2xl shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="timeGridWeek"
          locales={[faLocale]}
          locale="fa"
          firstDay={6}
          events={filteredEvents}
          slotMinTime="08:00:00"
          slotMaxTime="20:00:00"
          allDaySlot={false}
          height="auto"
          editable={true}
          dayHeaderContent={(arg) => {
            const dayEvents = filteredEvents.filter(
              (ev) =>
                new Date(ev.start).toDateString() ===
                new Date(arg.date).toDateString()
            );
            const userAvatars = [
              ...new Set(
                dayEvents.map((ev) => ev.extendedProps?.user?.avatar).filter(Boolean)
              ),
            ];

            return (
              <div className="flex flex-col items-center text-gray-700 text-sm">
                <span>{arg.text}</span>
                <div className="flex -space-x-2 mt-1">
                  {userAvatars.map((avatar, i) => (
                    <img
                      key={i}
                      src={avatar!}
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                    />
                  ))}
                </div>
              </div>
            );
          }}
          eventContent={(arg) => {
            const isBlocked = arg.event.display === "background";
            if (isBlocked)
              return (
                <div className="w-full h-full bg-gray-200 opacity-60 rounded-md" />
              );
            return (
              <div
                className="flex items-center gap-2 text-white px-2 py-1 rounded-md text-xs shadow-sm"
                style={{
                  backgroundColor: arg.event.backgroundColor || "#3b82f6",
                }}
              >
                <span>{arg.event.title}</span>
              </div>
            );
          }}
          eventClick={(info) => {
            const ev = info.event.toPlainObject() as EventType;
            setSelectedEvent(ev);
            setEditTitle(ev.title);
            setIsEditing(false);
          }}
        />
      </div>

      {/* Dialog ساخت رزرو */}
      <Dialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <h2 className="text-lg font-semibold mb-4 text-gray-700">رزرو جدید</h2>

        <label className="block mb-2 text-sm text-gray-600">انتخاب کاربر</label>
        <select
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          className="border p-2 rounded-xl w-full mb-4 bg-white"
        >
          <option value="">-- انتخاب کاربر --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        <label className="block mb-2 text-sm text-gray-600">تاریخ شروع</label>
        <DatePicker
          value={newStart}
          onChange={(date) => setNewStart(date?.toDate?.().toISOString() || "")}
          format="YYYY/MM/DD HH:mm"
          calendar={persian}
          locale={persian_fa}
          plugins={[<TimePicker position="bottom" />]}
          className="border p-2 rounded-xl w-full mb-4"
        />

        <label className="block mb-2 text-sm text-gray-600">تاریخ پایان</label>
        <DatePicker
          value={newEnd}
          onChange={(date) => setNewEnd(date?.toDate?.().toISOString() || "")}
          format="YYYY/MM/DD HH:mm"
          calendar={persian}
          locale={persian_fa}
          plugins={[<TimePicker position="bottom" />]}
          className="border p-2 rounded-xl w-full mb-4"
        />

        <label className="block mb-2 text-sm text-gray-600">توضیحات</label>
        <textarea
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          className="border p-2 rounded-xl w-full mb-4"
        />

        <div className="flex justify-between gap-3 mt-4">
          <button
            onClick={() => setIsCreateOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 transition"
          >
            بستن
          </button>
          <button
            onClick={createEvent}
            className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
          >
            ذخیره
          </button>
        </div>
      </Dialog>

      {/* Dialog جزئیات رزرو */}
      <Dialog isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)}>
        {selectedEvent && (
          <>
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-semibold text-gray-700">جزئیات رزرو</h2>
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 space-y-4">
              {selectedEvent.extendedProps?.user && (
                <div className="flex items-center gap-3">
                  <img
                    src={selectedEvent.extendedProps.user.avatar}
                    alt={selectedEvent.extendedProps.user.name}
                    className="w-12 h-12 rounded-full shadow"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {selectedEvent.extendedProps.user.name}
                    </p>
                    {!isEditing ? (
                      <p className="text-gray-500 text-sm">
                        {selectedEvent.title}
                      </p>
                    ) : (
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="border p-2 rounded-xl w-full mt-2"
                      />
                    )}
                  </div>
                </div>
              )}

              {selectedEvent.extendedProps?.description && (
                <p className="bg-gray-100 p-3 rounded-xl text-sm text-gray-600">
                  {selectedEvent.extendedProps.description}
                </p>
              )}

              <div className="bg-gray-100 p-3 rounded-xl text-sm text-gray-700">
                <p>
                  <span className="font-medium">شروع:</span>{" "}
                  {new Date(selectedEvent.start).toLocaleString("fa-IR")}
                </p>
                {selectedEvent.end && (
                  <p>
                    <span className="font-medium">پایان:</span>{" "}
                    {new Date(selectedEvent.end).toLocaleString("fa-IR")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6 border-t pt-4">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition"
                >
                  ویرایش
                </button>
              ) : (
                <button
                  onClick={saveEvent}
                  className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition"
                >
                  ذخیره
                </button>
              )}
              <button
                onClick={deleteEvent}
                className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
              >
                حذف
              </button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  );
}
