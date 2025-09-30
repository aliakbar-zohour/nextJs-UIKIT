// app/api/events/route.ts
import { NextResponse } from "next/server";
import { generateMockEvents, users } from "@/lib/mockData";

// single in-memory events array (برای mock)
let events = generateMockEvents();

export async function GET() {
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // اگر body.extendedProps.user.id موجود باشه، سعی می‌کنیم کاربر واقعی رو از users پیدا کنیم
    if (body.extendedProps?.user?.id) {
      const realUser = users.find(
        (u) => u.id === String(body.extendedProps.user.id)
      );
      if (realUser) {
        body.extendedProps.user = realUser;
      }
    }

    const exists = events.find((ev) => ev.id === body.id);
    if (exists) {
      events = events.map((ev) =>
        ev.id === body.id ? { ...ev, ...body } : ev
      );
    } else {
      // اگر id نداشت، برای ایونت جدید id بساز
      if (!body.id) {
        body.id = String(Date.now());
      }
      events.push(body);
    }

    return NextResponse.json({ success: true, events });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Invalid body" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id) {
      return NextResponse.json(
        { success: false, error: "id required" },
        { status: 400 }
      );
    }
    events = events.filter((ev) => ev.id !== body.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Invalid body" },
      { status: 400 }
    );
  }
}
