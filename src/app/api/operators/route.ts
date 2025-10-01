import { NextResponse } from "next/server";
import { operators } from "@/lib/mockData";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    let result = operators;
    if (q) {
      result = operators.filter(op => op.name.toLowerCase().includes(q.toLowerCase()));
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
