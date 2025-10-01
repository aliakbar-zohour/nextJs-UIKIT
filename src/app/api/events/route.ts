import { NextResponse } from "next/server";
import { generateMockEvents, operators, Event } from "@/lib/mockData";

let events: Event[] = generateMockEvents();

export async function GET() {
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // بررسی اپراتور
    const operator = operators.find((o) => o.id === body.extendedProps.operator.id);
    if (!operator) {
      return NextResponse.json({ success: false, error: "Operator not found" }, { status: 400 });
    }
    body.extendedProps.operator = operator;

    // بررسی اینکه تایم خالی است یا نه
    const conflict = events.some(ev =>
      ev.extendedProps.operator.id === operator.id &&
      ((new Date(body.start) >= new Date(ev.start) && new Date(body.start) < new Date(ev.end)) ||
       (new Date(body.end) > new Date(ev.start) && new Date(body.end) <= new Date(ev.end)))
    );

    if (conflict) {
      return NextResponse.json({ success: false, error: "این اپراتور در این تایم رزرو دارد" }, { status: 409 });
    }

    if (!body.id) body.id = String(Date.now());
    events.push(body);

    return NextResponse.json({ success: true, events });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body?.id) return NextResponse.json({ success: false, error: "id required" }, { status: 400 });

    events = events.filter(ev => ev.id !== body.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
}
