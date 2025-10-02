import { NextResponse } from "next/server";
import { generateMockEvents, operators, Event } from "@/lib/mockData";

let events: Event[] = generateMockEvents();

export async function GET() {
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const operator = operators.find((o) => o.id === body.extendedProps.operator.id);
    if (!operator) {
      return NextResponse.json({ success: false, error: "Operator not found" }, { status: 400 });
    }
    body.extendedProps.operator = operator;
    const newStart = new Date(body.start);
    const newEnd = new Date(body.end);
    
    const conflict = events.some(ev => {
      if (ev.extendedProps.operator.id !== operator.id) return false;
      
      const existingStart = new Date(ev.start);
      const existingEnd = new Date(ev.end);
      
      return newStart < existingEnd && newEnd > existingStart;
    });

    if (conflict) {
      return NextResponse.json({ success: false, error: "این اپراتور در این تایم رزرو دارد" }, { status: 409 });
    }

    if (!body.id) body.id = String(Date.now());
    events.push(body);

    return NextResponse.json({ success: true, event: body, events });
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
