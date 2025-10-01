"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { Operator, Event } from "@/lib/mockData";
import Button from "@/components/ui/Button/Button";

interface CreateFormProps {
  operators: Operator[];
  events: Event[];
  onClose: () => void;
  onSave: (event: Event) => void;
}

export default function CreateEventForm({ operators, events, onClose, onSave }: CreateFormProps) {
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [services, setServices] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [availableTimes, setAvailableTimes] = useState<Date[]>([]);

  useEffect(() => {
    if (!selectedOperator) return;

    // محاسبه تایم‌های آزاد اپراتور در روز انتخاب شده
    const times: Date[] = [];
    for (let h = 8; h <= 17; h++) {
      const start = new Date(selectedDate);
      start.setHours(h, 0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);

      const conflict = events.some(ev =>
        ev.extendedProps.operator.id === selectedOperator.id &&
        ((start >= new Date(ev.start) && start < new Date(ev.end)) ||
         (end > new Date(ev.start) && end <= new Date(ev.end)))
      );
      if (!conflict) times.push(start);
    }
    setAvailableTimes(times);
  }, [selectedOperator, selectedDate, events]);

  const saveEvent = () => {
    if (!selectedOperator || availableTimes.length === 0) {
      alert("اپراتور انتخاب نشده یا تایم خالی وجود ندارد!");
      return;
    }

    const start = availableTimes[0];
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    const newEvent: Event = {
      id: String(Date.now()),
      title: `رزرو ${selectedOperator.name}`,
      start: start.toISOString(),
      end: end.toISOString(),
      extendedProps: {
        operator: selectedOperator,
        services,
        description,
      },
    };
    onSave(newEvent);
  };

  const timePickerPlugin = <TimePicker position="bottom" />;

  return (
    <div className="p-4 h-full flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-700">رزرو جدید</h2>

        <label className="block mb-2 text-sm text-gray-600">انتخاب اپراتور</label>
        <select
          className="border rounded-lg px-3 py-2 mb-4 w-full"
          value={selectedOperator?.id || ""}
          onChange={(e) => setSelectedOperator(operators.find(op => op.id === e.target.value) || null)}
        >
          <option value="">انتخاب اپراتور</option>
          {operators.map(op => (
            <option key={op.id} value={op.id}>{op.name} ({op.specialty})</option>
          ))}
        </select>

        <label className="block mb-2 text-sm text-gray-600">تاریخ رزرو</label>
        <DatePicker
          value={selectedDate}
          onChange={(d: any) => setSelectedDate(d.toDate())}
          format="YYYY/MM/DD"
          calendar={persian}
          locale={persian_fa}
          className="border p-2 rounded-xl w-full mb-4"
        />

        <label className="block mb-2 text-sm text-gray-600">سرویس‌ها</label>
        <input
          type="text"
          value={services.join(", ")}
          onChange={(e) => setServices(e.target.value.split(",").map(s => s.trim()))}
          placeholder="مثلا: جراحی بینی, مساج"
          className="border p-2 rounded-xl w-full mb-4"
        />

        <label className="block mb-2 text-sm text-gray-600">توضیحات</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border p-2 rounded-xl w-full mb-4"
        />

        <label className="block mb-2 text-sm text-gray-600">تایم‌های آزاد</label>
        <ul className="list-disc list-inside text-gray-700 mb-4">
          {availableTimes.length === 0 ? (
            <li>تایم خالی وجود ندارد!</li>
          ) : (
            availableTimes.map((t, i) => (
              <li key={i}>{t.getHours()}:00 - {t.getHours() + 1}:00</li>
            ))
          )}
        </ul>
      </div>

      <div className="flex gap-3">
        <Button onClick={onClose} variant="secondary" className="w-full py-3">بستن</Button>
        <Button onClick={saveEvent} variant="primary" className="w-full py-3">ذخیره</Button>
      </div>
    </div>
  );
}
