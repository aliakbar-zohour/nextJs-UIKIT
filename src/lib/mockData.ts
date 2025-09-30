export interface User {
  id: string;
  name: string;
  avatar: string;
}

// Single source of truth for users
export const users: User[] = [
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

export function generateMockEvents(): any[] {
  const events: any[] = [];
  const startOfMonth = new Date("2025-10-01T00:00:00");

  for (let i = 0; i < 50; i++) {
    const dayOffset = Math.floor(Math.random() * 30);
    const eventDate = new Date(startOfMonth);
    eventDate.setDate(eventDate.getDate() + dayOffset);

    if (i % 15 === 0) {
      const endDate = new Date(eventDate);
      endDate.setDate(endDate.getDate() + 1);
      events.push({
        id: `bg-${i}`,
        title: "روز بلاک",
        start: eventDate.toISOString().split("T")[0],
        end: endDate.toISOString().split("T")[0],
        display: "background",
        color: "#fbbf24",
      });
      continue;
    }

    const numUsers = Math.floor(Math.random() * 4) + 1; // 1..4
    const picked: typeof users = [];
    for (let j = 0; j < numUsers; j++) {
      const u = users[Math.floor(Math.random() * users.length)];
      picked.push(u);
    }

    picked.forEach((user, idx) => {
      const startHour = 8 + Math.floor(Math.random() * 10);
      const start = new Date(eventDate);
      start.setHours(startHour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 1); // 1 hour

      events.push({
        id: `ev-${i}-${idx}`,
        title: `رزرو ${user.name}`,
        start: start.toISOString(),
        end: end.toISOString(),
        color: ["#3b82f6", "#10b981", "#ef4444", "#8b5cf6"][idx % 4],
        extendedProps: {
          user,
        },
      });
    });
  }

  return events;
}
