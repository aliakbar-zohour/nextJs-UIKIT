import { NextResponse } from "next/server";
import { users } from "@/lib/mockData";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    let result = users;
    if (q) {
      result = users.filter((user) =>
        user.name.toLowerCase().includes(q.toLowerCase())
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
