import { NextResponse } from "next/server";

let users = [
  { id: "1", name: "علی", avatar: "https://i.pravatar.cc/100?img=1" },
  { id: "2", name: "زهرا", avatar: "https://i.pravatar.cc/100?img=2" },
  { id: "3", name: "مهدی", avatar: "https://i.pravatar.cc/100?img=3" },
];

export async function GET() {
  return NextResponse.json(users);
}
