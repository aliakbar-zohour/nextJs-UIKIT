import { EventType } from "@/app/types/types";

export default function EventItem({ event }: { event: EventType }) {
  const startTime = event.start
    ? new Date(event.start).toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const avatar = event.extendedProps?.user?.avatar;

  return (
    <div
      className="flex items-center gap-2 text-white px-2 py-1 rounded-md text-xs shadow-sm"
      style={{ backgroundColor: event.color || "#3b82f6" }}
    >
      {avatar && (
        <img
          src={avatar}
          className="w-12 h-12 rounded-full border border-white"
        />
      )}
      <span>{event.title}</span>
      <span>{startTime}</span>
    </div>
  );
}
