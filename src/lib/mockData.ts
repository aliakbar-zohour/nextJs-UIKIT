export interface Operator {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
}

// Single source of truth for operators
export const operators: Operator[] = [
  { id: "1", name: "علی", avatar: "https://i.pravatar.cc/100?img=1", specialty: "جراحی بینی" },
  { id: "2", name: "زهرا", avatar: "https://i.pravatar.cc/100?img=2", specialty: "لیفت صورت" },
  { id: "3", name: "مهدی", avatar: "https://i.pravatar.cc/100?img=3", specialty: "مساج" },
  { id: "4", name: "سارا", avatar: "https://i.pravatar.cc/100?img=4", specialty: "آموزش" },
  { id: "5", name: "رضا", avatar: "https://i.pravatar.cc/100?img=5", specialty: "جراحی بینی" },
  { id: "6", name: "فاطمه", avatar: "https://i.pravatar.cc/100?img=6", specialty: "لیفت صورت" },
];

export interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
  color?: string;
  extendedProps: {
    operator: Operator;
    services: string[];
    description?: string;
  };
}

// تولید ایونت‌های آزمایشی با اپراتورها
export function generateMockEvents(): Event[] {
  const events: Event[] = [];
  const startOfMonth = new Date("2025-10-01T08:00:00");

  for (let i = 0; i < 30; i++) {
    const dayOffset = Math.floor(Math.random() * 30);
    const eventDate = new Date(startOfMonth);
    eventDate.setDate(eventDate.getDate() + dayOffset);

    const operator = operators[Math.floor(Math.random() * operators.length)];
    const startHour = 8 + Math.floor(Math.random() * 10);
    const start = new Date(eventDate);
    start.setHours(startHour, 0, 0, 0);

    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    events.push({
      id: `ev-${i}`,
      title: `رزرو ${operator.name}`,
      start: start.toISOString(),
      end: end.toISOString(),
      color: ["#3b82f6", "#10b981", "#ef4444", "#8b5cf6"][i % 4],
      extendedProps: {
        operator,
        services: [operator.specialty],
      },
    });
  }

  return events;
}
