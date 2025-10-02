import { NextResponse } from "next/server";
import { BlockedDay } from "@/app/types/types";

let blockedDays: BlockedDay[] = [];

export async function GET() {
  return NextResponse.json(blockedDays);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const newBlockedDay: BlockedDay = {
      id: String(Date.now()),
      date: body.date,
      reason: body.reason || "روز بلاک شده"
    };

    // Check if day is already blocked
    const existingBlock = blockedDays.find(day => day.date === body.date);
    if (existingBlock) {
      return NextResponse.json({ success: false, error: "این روز قبلاً بلاک شده است" }, { status: 409 });
    }

    blockedDays.push(newBlockedDay);
    return NextResponse.json({ success: true, blockedDay: newBlockedDay, blockedDays });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    if (!body?.date) return NextResponse.json({ success: false, error: "date required" }, { status: 400 });

    blockedDays = blockedDays.filter(day => day.date !== body.date);
    return NextResponse.json({ success: true, blockedDays });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
}
