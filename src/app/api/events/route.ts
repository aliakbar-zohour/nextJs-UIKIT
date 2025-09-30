import { NextResponse } from "next/server";

let events = [
  {
    id: "1",
    title: "رزرو کاربر ۱",
    start: "2025-10-01T09:00:00",
    end: "2025-10-01T11:00:00",
    color: "#3b82f6",
    extendedProps: {
      user: { name: "علی", avatar: "https://i.pravatar.cc/40?u=1" },
    },
  },
  {
    id: "2",
    title: "رزرو کاربر ۲",
    start: "2025-10-02T13:00:00",
    end: "2025-10-02T14:30:00",
    color: "#ef4444",
    extendedProps: {
      user: { name: "سارا", avatar: "https://i.pravatar.cc/40?u=2" },
    },
  },
  {
    id: "3",
    title: "روز بلاک",
    start: "2025-10-03",
    end: "2025-10-04",
    display: "background",
    color: "#fbbf24",
  },
];

export async function GET() {
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const body = await req.json();
  events = events.map((ev) => (ev.id === body.id ? { ...ev, ...body } : ev));
  return NextResponse.json({ success: true, events });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  events = events.filter((ev) => ev.id !== body.id);
  return NextResponse.json({ success: true });
}
