"use client";

import { useState, useEffect } from "react";
import { Operator, EventType } from "@/app/types/types";
import Button from "@/components/ui/Button/Button";
import { useToastHelpers } from "@/components/ui/Toast/useToast";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import Image from "next/image";
import { DateObject } from "react-multi-date-picker";

dayjs.extend(isSameOrBefore);

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
  const toast = useToastHelpers();
  const [title, setTitle] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );
  const [operatorQuery, setOperatorQuery] = useState("");
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedDates, setSuggestedDates] = useState<string[]>([]);

  // Live search for operators
  useEffect(() => {
    if (operatorQuery.trim()) {
      const filtered = operators.filter(op => 
        op.name.toLowerCase().includes(operatorQuery.toLowerCase())
      );
      setFilteredOperators(filtered);
      setShowOperatorDropdown(true);
    } else {
      setFilteredOperators([]);
      setShowOperatorDropdown(false);
    }
  }, [operatorQuery, operators]);

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

    // تبدیل بازه‌های آزاد به تایم‌های جداگانه
    const timeSlots: { start: string; end: string }[] = [];
    
    free.forEach((f) => {
      const startTime = dayjs(`${dateStr}T${f.start}`);
      const endTime = dayjs(`${dateStr}T${f.end}`);
      
      let currentTime = startTime;
      while (currentTime.add(totalDuration, 'minute').isSameOrBefore(endTime)) {
        const slotEnd = currentTime.add(totalDuration, 'minute');
        timeSlots.push({
          start: currentTime.format('HH:mm'),
          end: slotEnd.format('HH:mm')
        });
        currentTime = currentTime.add(30, 'minute'); // 30 minute intervals
      }
    });

    setFreeIntervals(timeSlots);
    setSelectedInterval(null);

    // If no free intervals, suggest alternative dates
    if (timeSlots.length === 0 && selectedOperator && selectedServices.length > 0) {
      const suggestions = findAlternativeDates(selectedOperator, totalDuration, dateStr);
      setSuggestedDates(suggestions);
    } else {
      setSuggestedDates([]);
    }
  }, [selectedOperator, selectedDate, selectedServices, events, totalDuration]);

  // Function to find alternative dates with available slots
  const findAlternativeDates = (operator: Operator, duration: number, currentDate: string) => {
    const suggestions: string[] = [];
    const currentDateObj = dayjs(currentDate);
    
    // Check next 7 days
    for (let i = 1; i <= 7 && suggestions.length < 3; i++) {
      const checkDate = currentDateObj.add(i, 'day');
      const checkDateStr = checkDate.format('YYYY-MM-DD');
      
      // Get events for this operator on this date
      const operatorEvents = events
        .filter(e => 
          e.extendedProps.operator.id === operator.id &&
          dayjs(e.start).format('YYYY-MM-DD') === checkDateStr
        )
        .map(e => ({
          start: dayjs(e.start),
          end: e.end ? dayjs(e.end) : dayjs(e.start).add(30, 'minute')
        }))
        .sort((a, b) => a.start.valueOf() - b.start.valueOf());

      const workStart = dayjs(`${checkDateStr}T08:00`);
      const workEnd = dayjs(`${checkDateStr}T20:00`);

      const free: { start: string; end: string }[] = [];
      let lastEnd = workStart;

      for (let ev of operatorEvents) {
        if (ev.start.isAfter(lastEnd)) {
          free.push({
            start: lastEnd.format('HH:mm'),
            end: ev.start.format('HH:mm')
          });
        }
        lastEnd = ev.end.isAfter(lastEnd) ? ev.end : lastEnd;
      }

      if (lastEnd.isBefore(workEnd)) {
        free.push({
          start: lastEnd.format('HH:mm'),
          end: workEnd.format('HH:mm')
        });
      }

      // Check if any free interval can accommodate the duration
      const hasAvailableSlot = free.some(f => {
        const diff = dayjs(`${checkDateStr}T${f.end}`).diff(
          dayjs(`${checkDateStr}T${f.start}`),
          'minute'
        );
        return diff >= duration;
      });

      if (hasAvailableSlot) {
        suggestions.push(checkDateStr);
      }
    }
    
    return suggestions;
  };

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleOperatorSelect = (operator: Operator) => {
    setSelectedOperator(operator);
    setOperatorQuery(operator.name);
    setShowOperatorDropdown(false);
    setFilteredOperators([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedOperator || !selectedInterval || !selectedDate) {
      toast.warning("لطفاً تمام فیلدها را پر کنید", {
        title: "اطلاعات ناقص"
      });
      return;
    }

    setIsSubmitting(true);

    try {
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

      // API call to save the event
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("رزرو با موفقیت ثبت شد", {
          title: "موفقیت"
        });
        // Use the event returned from API to ensure consistency
        onSave(result.event || newEvent);
        
        // Close the form
        onClose();
        
        // Reset form
        setTitle("");
        setSelectedOperator(null);
        setOperatorQuery("");
        setSelectedDate(null);
        setSelectedServices([]);
        setDescription("");
        setSelectedInterval(null);
        setFreeIntervals([]);
        setSuggestedDates([]);
      } else {
        // Show specific error message from API
        toast.error(result.error || "خطا در ثبت رزرو", {
          title: "خطا در رزرو"
        });
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور", {
        title: "خطا"
      });
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Live search for operators */}
      <div className="relative">
        <input
          type="text"
          placeholder="جستجوی اپراتور..."
          value={operatorQuery}
          onChange={(e) => setOperatorQuery(e.target.value)}
          onFocus={() => operatorQuery && setShowOperatorDropdown(true)}
          onBlur={() => setTimeout(() => setShowOperatorDropdown(false), 200)}
          className="border rounded px-3 py-2 w-full"
        />
        
        {showOperatorDropdown && filteredOperators.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredOperators.map((operator) => (
              <div
                key={operator.id}
                onClick={() => handleOperatorSelect(operator)}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer"
              >
                <Image
                  src={operator.avatar}
                  alt={operator.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium">{operator.name}</div>
                  <div className="text-sm text-gray-500">{operator.specialty}</div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {selectedOperator && (
          <div className="mt-2 p-2 bg-blue-50 rounded flex items-center gap-3">
            <Image
              src={selectedOperator.avatar}
              alt={selectedOperator.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <div className="font-medium">{selectedOperator.name}</div>
              <div className="text-sm text-gray-500">{selectedOperator.specialty}</div>
            </div>
          </div>
        )}
      </div>

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

      {selectedServices.length > 0 && selectedOperator && selectedDate && (
        <div>
          <label className="mb-2 block font-medium">
            تایم‌های خالی (مدت زمان مورد نیاز: {totalDuration} دقیقه):
          </label>
          {freeIntervals.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
              {freeIntervals.map((f, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedInterval(f)}
                  className={`p-3 border rounded cursor-pointer transition-colors text-center ${
                    selectedInterval?.start === f.start
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-300"
                  }`}
                >
                  <div className="font-medium">{f.start}</div>
                  <div className="text-xs opacity-75">
                    {totalDuration} دقیقه
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700">
                هیچ تایم خالی برای این انتخاب وجود ندارد
              </div>
              
              {suggestedDates.length > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-blue-800 mb-2">
                    روزهای پیشنهادی با تایم خالی:
                  </div>
                  <div className="space-y-2">
                    {suggestedDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          // Convert to Persian date object for the date picker
                          const gregorianDate = new Date(date);
                          const persianDateObj = new DateObject({
                            date: gregorianDate,
                            calendar: persian,
                            locale: persian_fa
                          });
                          setSelectedDate(persianDateObj);
                        }}
                        className="block w-full text-right p-2 bg-white border border-blue-300 rounded hover:bg-blue-100 transition-colors"
                      >
                        {dayjs(date).locale('fa').format('dddd DD MMMM YYYY')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <textarea
        placeholder="توضیحات"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border rounded px-3 py-2"
      />

      <div className="flex gap-2 justify-end mt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          لغو
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "در حال ثبت..." : "ثبت رزرو"}
        </Button>
      </div>
    </form>
  );
}
