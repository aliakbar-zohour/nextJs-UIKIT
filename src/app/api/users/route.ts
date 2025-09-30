import { NextResponse } from "next/server";

let users = [
  { id: "1", name: "علی", avatar: "https://i.pravatar.cc/100?img=1" },
  { id: "2", name: "زهرا", avatar: "https://i.pravatar.cc/100?img=2" },
  { id: "3", name: "مهدی", avatar: "https://i.pravatar.cc/100?img=3" },
  { id: "4", name: "سارا", avatar: "https://i.pravatar.cc/100?img=4" },
  { id: "5", name: "رضا", avatar: "https://i.pravatar.cc/100?img=5" },
  { id: "6", name: "فاطمه", avatar: "https://i.pravatar.cc/100?img=6" },
  { id: "7", name: "حسین", avatar: "https://i.pravatar.cc/100?img=7" },
  { id: "8", name: "نگار", avatar: "https://i.pravatar.cc/100?img=8" },
  { id: "9", name: "امیر", avatar: "https://i.pravatar.cc/100?img=9" },
  { id: "10", name: "مریم", avatar: "https://i.pravatar.cc/100?img=10" },
  { id: "11", name: "کامران", avatar: "https://i.pravatar.cc/100?img=11" },
  { id: "12", name: "الهام", avatar: "https://i.pravatar.cc/100?img=12" },
  { id: "13", name: "نوید", avatar: "https://i.pravatar.cc/100?img=13" },
  { id: "14", name: "شبنم", avatar: "https://i.pravatar.cc/100?img=14" },
  { id: "15", name: "پیمان", avatar: "https://i.pravatar.cc/100?img=15" },
];

export async function GET(request: any) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  let result = users;
  if (q) {
    result = users.filter((user) =>
      user.name.toLowerCase().includes(q.toLowerCase())
    );
  }

  return NextResponse.json(result);
}
