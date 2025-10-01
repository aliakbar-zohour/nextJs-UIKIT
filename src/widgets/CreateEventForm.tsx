"use client";

import { useState, useEffect } from "react";
import { Operator, EventType } from "@/app/types/types";
import Button from "@/components/ui/Button/Button";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import dayjs from "dayjs";

interface CreateEventFormProps {
  operators: Operator[];
  events: EventType[];
  onSave: (newEvent: EventType) => void;
  onClose: () => void;
}

interface Service {
  name: string;
  duration: number;
}

const SERVICES: Service[] = [
  { name: "ماساژ", duration: 30 },
  { name: "اصلاح", duration: 20 },
  { name: "مانیکور", duration: 40 },
];

export default function CreateEventForm({
  operators,
  events,
  onSave,
  onClose,
}: CreateEventFormProps) {
  const [title, setTitle] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );
  const [operatorQuery, setOperatorQuery] = useState("");
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [freeIntervals, setFreeIntervals] = useState<
    { start: string; end: string }[]
  >([]);
  const [selectedInterval, setSelectedInterval] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // محاسبه مجموع زمان سرویس‌ها + 10 دقیقه
  const totalDuration =
    selectedServices.reduce((acc, s) => {
      const service = SERVICES.find((svc) => svc.name === s);
      return acc + (service?.duration || 0);
    }, 0) + (selectedServices.length > 0 ? 10 : 0);

  // پیدا کردن بازه‌های آزاد
  useEffect(() => {
    if (!selectedOperator || !selectedDate || selectedServices.length === 0)
      return;

    const dateStr = dayjs(selectedDate.toDate()).format("YYYY-MM-DD");

    const operatorEvents = events
      .filter(
        (e) =>
          e.extendedProps.operator.id === selectedOperator.id &&
          dayjs(e.start).format("YYYY-MM-DD") === dateStr
      )
      .map((e) => ({
        start: dayjs(e.start),
        end: e.end ? dayjs(e.end) : dayjs(e.start).add(30, "minute"),
      }))
      .sort((a, b) => a.start.valueOf() - b.start.valueOf());

    const workStart = dayjs(`${dateStr}T08:00`);
    const workEnd = dayjs(`${dateStr}T20:00`);

    const free: { start: string; end: string }[] = [];
    let lastEnd = workStart;

    for (let ev of operatorEvents) {
      if (ev.start.isAfter(lastEnd)) {
        free.push({
          start: lastEnd.format("HH:mm"),
          end: ev.start.format("HH:mm"),
        });
      }
      lastEnd = ev.end.isAfter(lastEnd) ? ev.end : lastEnd;
    }

    if (lastEnd.isBefore(workEnd)) {
      free.push({
        start: lastEnd.format("HH:mm"),
        end: workEnd.format("HH:mm"),
      });
    }

    // فقط بازه‌هایی که ظرفیت totalDuration رو دارن
    const validIntervals = free.filter((f) => {
      const diff = dayjs(`${dateStr}T${f.end}`).diff(
        dayjs(`${dateStr}T${f.start}`),
        "minute"
      );
      return diff >= totalDuration;
    });

    setFreeIntervals(validIntervals);
    setSelectedInterval(null);
  }, [selectedOperator, selectedDate, selectedServices, events, totalDuration]);

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedOperator || !selectedInterval || !selectedDate) {
      alert("لطفاً تمام فیلدها را پر کنید");
      return;
    }

    const dateStr = dayjs(selectedDate.toDate()).format("YYYY-MM-DD");
    const startDateTime = dayjs(
      `${dateStr}T${selectedInterval.start}`
    ).toISOString();
    const endDateTime = dayjs(startDateTime)
      .add(totalDuration, "minute")
      .toISOString();

    const newEvent: EventType = {
      id: `${Date.now()}`,
      title,
      start: startDateTime,
      end: endDateTime,
      extendedProps: {
        operator: selectedOperator,
        services: selectedServices,
        description: description || undefined,
      },
    };

    onSave(newEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
      <input
        type="text"
        placeholder="عنوان رزرو"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border rounded px-3 py-2"
      />

      {/* انتخاب اپراتور ساده */}
      <input
        type="text"
        placeholder="نام اپراتور..."
        value={operatorQuery}
        onChange={(e) => {
          setOperatorQuery(e.target.value);
          const op = operators.find((o) => o.name.includes(e.target.value));
          setSelectedOperator(op || null);
        }}
        className="border rounded px-3 py-2"
      />

      <div>
        <label className="mb-1 block">سرویس‌ها:</label>
        <div className="flex gap-2 flex-wrap">
          {SERVICES.map((s) => (
            <button
              type="button"
              key={s.name}
              className={`px-3 py-1 border rounded ${
                selectedServices.includes(s.name)
                  ? "bg-blue-500 text-white"
                  : "bg-white"
              }`}
              onClick={() => toggleService(s.name)}
            >
              {s.name} ({s.duration} دقیقه)
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block">تاریخ رزرو:</label>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          calendar={persian}
          locale={persian_fa}
          className="border rounded px-3 py-2 w-full"
          placeholder="تاریخ را انتخاب کنید"
        />
      </div>

      <div className="space-y-2">
        {freeIntervals.length > 0 ? (
          freeIntervals.map((f, i) => (
            <div
              key={i}
              onClick={() => setSelectedInterval(f)}
              className={`p-2 border rounded cursor-pointer ${
                selectedInterval?.start === f.start
                  ? "bg-green-500 text-white"
                  : "bg-white"
              }`}
            >
              از {f.start} تا {f.end} خالی است
            </div>
          ))
        ) : (
          <p>هیچ بازه آزادی برای این انتخاب وجود ندارد</p>
        )}
      </div>

      <textarea
        placeholder="توضیحات"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border rounded px-3 py-2"
      />

      <div className="flex gap-2 justify-end mt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          لغو
        </Button>
        <Button type="submit">ثبت رزرو</Button>
      </div>
    </form>
  );
}
