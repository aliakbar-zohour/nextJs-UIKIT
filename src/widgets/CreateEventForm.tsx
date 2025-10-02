"use client";

import { useState, useEffect } from "react";
import { Operator, EventType, BlockedDay } from "@/app/types/types";
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
  blockedDays?: BlockedDay[];
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
  blockedDays = [],
  onSave,
  onClose,
}: CreateEventFormProps) {
  const toast = useToastHelpers();
  const [currentStep, setCurrentStep] = useState(1); // 1: Operator Selection, 2: Time Selection
  const [title, setTitle] = useState("");
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(
    null
  );
  const [operatorQuery, setOperatorQuery] = useState("");
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [showOperatorDropdown, setShowOperatorDropdown] = useState(false);
  const [selectedDate, setSelectedDate] = useState<any>(() => {
    // Set current date as default
    return new DateObject({ calendar: persian, locale: persian_fa });
  });
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
    
    // Check if the selected date is blocked
    const isBlocked = blockedDays.some(blocked => blocked.date === dateStr);
    if (isBlocked) {
      setFreeIntervals([]);
      setSuggestedDates([]);
      toast.warning("این روز بلاک شده است", {
        title: "روز غیرفعال"
      });
      return;
    }

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
    const now = dayjs();
    const isToday = dateStr === now.format("YYYY-MM-DD");
    
    free.forEach((f) => {
      const startTime = dayjs(`${dateStr}T${f.start}`);
      const endTime = dayjs(`${dateStr}T${f.end}`);
      
      let currentTime = startTime;
      while (currentTime.add(totalDuration, 'minute').isSameOrBefore(endTime)) {
        const slotStart = currentTime;
        const slotEnd = currentTime.add(totalDuration, 'minute');
        
        // For today: Skip past time slots (must be after current time)
        if (isToday && slotStart.isSameOrBefore(now)) {
          currentTime = currentTime.add(30, 'minute'); // 30 minute intervals
          continue;
        }
        
        // Strict overlap checking - check against ALL events, not just operator events
        const hasConflict = events.some(event => {
          // Skip events that are not for the same operator
          if (event.extendedProps.operator.id !== selectedOperator.id) {
            return false;
          }
          
          // Skip events that are not on the same date
          const eventDate = dayjs(event.start).format("YYYY-MM-DD");
          if (eventDate !== dateStr) {
            return false;
          }
          
          const eventStart = dayjs(event.start);
          const eventEnd = event.end ? dayjs(event.end) : dayjs(event.start).add(30, "minute");
          
          // Strict overlap check - no overlapping allowed at all
          // Two time slots overlap if: start1 < end2 AND start2 < end1
          return (slotStart.isBefore(eventEnd) && eventStart.isBefore(slotEnd));
        });
        
        // Only add slot if no conflict
        if (!hasConflict) {
          timeSlots.push({
            start: currentTime.format('HH:mm'),
            end: slotEnd.format('HH:mm')
          });
        }
        
        currentTime = currentTime.add(30, 'minute'); // 30 minute intervals
      }
    });

    setFreeIntervals(timeSlots);
    setSelectedInterval(null);

    // If no free intervals, suggest alternative dates
    if (timeSlots.length === 0 && selectedOperator && selectedServices.length > 0) {
      // For today with no available slots, prioritize tomorrow
      const suggestions = findAlternativeDates(selectedOperator, totalDuration, dateStr, isToday);
      setSuggestedDates(suggestions);
    } else {
      setSuggestedDates([]);
    }
  }, [selectedOperator, selectedDate, selectedServices, events, totalDuration, blockedDays]);

  // Function to find alternative dates with available slots
  const findAlternativeDates = (operator: Operator, duration: number, currentDate: string, isCurrentDateToday: boolean = false) => {
    const suggestions: string[] = [];
    const currentDateObj = dayjs(currentDate);
    const today = dayjs();
    
    // If current date is today and has no slots, start from tomorrow
    let startDay = 1;
    if (isCurrentDateToday) {
      startDay = 1; // Start from tomorrow
    } else if (currentDateObj.isSameOrBefore(today, 'day')) {
      startDay = today.diff(currentDateObj, 'day') + 1;
    }
    
    // Check next 7 days from the appropriate starting point
    for (let i = startDay; i <= 7 && suggestions.length < 3; i++) {
      const checkDate = currentDateObj.add(i, 'day');
      const checkDateStr = checkDate.format('YYYY-MM-DD');
      
      // Skip if this date is blocked
      const isBlocked = blockedDays.some(blocked => blocked.date === checkDateStr);
      if (isBlocked) continue;
      
      // Get ALL events for this operator on this date (strict checking)
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

      // Check if any free interval can accommodate the duration (strict checking)
      const hasAvailableSlot = free.some(f => {
        const freeStart = dayjs(`${checkDateStr}T${f.start}`);
        const freeEnd = dayjs(`${checkDateStr}T${f.end}`);
        const diff = freeEnd.diff(freeStart, 'minute');
        
        if (diff < duration) return false;
        
        // Additional check: ensure no overlaps within this free slot
        let currentSlot = freeStart;
        while (currentSlot.add(duration, 'minute').isSameOrBefore(freeEnd)) {
          const slotEnd = currentSlot.add(duration, 'minute');
          
          // Check if this specific slot overlaps with any existing event
          const hasConflict = operatorEvents.some(event => {
            return (currentSlot.isBefore(event.end) && event.start.isBefore(slotEnd));
          });
          
          if (!hasConflict) {
            return true; // Found at least one available slot
          }
          
          currentSlot = currentSlot.add(30, 'minute');
        }
        
        return false;
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

  // Handle moving to time selection step
  const handleProceedToTimeSelection = () => {
    if (!selectedOperator) {
      toast.warning("لطفاً اپراتور را انتخاب کنید", {
        title: "اطلاعات ناقص"
      });
      return;
    }

    setCurrentStep(2);
  };

  // Handle going back to operator selection
  const handleBackToOperatorSelection = () => {
    setCurrentStep(1);
    setSelectedDate(new DateObject({ calendar: persian, locale: persian_fa }));
    setSelectedServices([]);
    setSelectedInterval(null);
    setFreeIntervals([]);
    setSuggestedDates([]);
  };

  const handleOperatorSelect = (operator: Operator) => {
    setSelectedOperator(operator);
    setOperatorQuery(operator.name);
    setShowOperatorDropdown(false);
    setFilteredOperators([]);
  };

  const handleSubmit = async () => {
    if (!selectedOperator || !title || !selectedDate || selectedServices.length === 0 || !selectedInterval) {
      toast.warning("لطفاً تمام فیلدها را پر کنید", {
        title: "اطلاعات ناقص"
      });
      return;
    }

    // Additional validation: Check if selected time is not in the past for today
    const dateStr = dayjs(selectedDate.toDate()).format("YYYY-MM-DD");
    const now = dayjs();
    const isToday = dateStr === now.format("YYYY-MM-DD");
    
    if (isToday) {
      const selectedStartTime = dayjs(`${dateStr}T${selectedInterval.start}`);
      if (selectedStartTime.isSameOrBefore(now)) {
        toast.warning("نمی‌توانید برای زمان گذشته رزرو کنید", {
          title: "زمان نامعتبر"
        });
        return;
      }
    }

    // Final overlap check before submission
    const startDateTime = dayjs(`${dateStr}T${selectedInterval.start}`);
    const endDateTime = startDateTime.add(totalDuration, "minute");
    
    const hasConflict = events.some(event => {
      if (event.extendedProps.operator.id !== selectedOperator.id) return false;
      
      const eventDate = dayjs(event.start).format("YYYY-MM-DD");
      if (eventDate !== dateStr) return false;
      
      const eventStart = dayjs(event.start);
      const eventEnd = event.end ? dayjs(event.end) : dayjs(event.start).add(30, "minute");
      
      return (startDateTime.isBefore(eventEnd) && eventStart.isBefore(endDateTime));
    });
    
    if (hasConflict) {
      toast.error("این زمان قبلاً رزرو شده است. لطفاً زمان دیگری انتخاب کنید", {
        title: "تداخل زمانی"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateTimeISO = dayjs(
        `${dateStr}T${selectedInterval.start}`
      ).toISOString();
      const endDateTimeISO = dayjs(startDateTimeISO)
        .add(totalDuration, "minute")
        .toISOString();

      const newEvent: EventType = {
        id: `${Date.now()}`,
        title: title,
        start: startDateTimeISO,
        end: endDateTimeISO,
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
        setCurrentStep(1);
        setTitle("");
        setSelectedOperator(null);
        setOperatorQuery("");
        setSelectedDate(new DateObject({ calendar: persian, locale: persian_fa }));
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
    <div className="flex flex-col gap-4 p-4">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep === 1 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
          }`}>
            1
          </div>
          <span className={`text-sm ${currentStep === 1 ? 'text-blue-600 font-medium' : 'text-green-600'}`}>
            انتخاب اپراتور
          </span>
          <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep === 2 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            2
          </div>
          <span className={`text-sm ${currentStep === 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
            انتخاب زمان
          </span>
        </div>
      </div>

      {currentStep === 1 ? (
        // Step 1: Operator Selection
        <form onSubmit={(e) => { e.preventDefault(); handleProceedToTimeSelection(); }} className="flex flex-col gap-4">
          {/* Operator Selection */}
          <div className="relative">
            <label className="mb-2 block font-medium">انتخاب اپراتور:</label>
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
              <div className="mt-2 p-3 bg-blue-50 rounded flex items-center gap-3">
                <Image
                  src={selectedOperator.avatar}
                  alt={selectedOperator.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <div className="font-medium">{selectedOperator.name}</div>
                  <div className="text-sm text-gray-500">{selectedOperator.specialty}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              لغو
            </Button>
            <Button type="submit" disabled={!selectedOperator}>
              ادامه - انتخاب زمان
            </Button>
          </div>
        </form>
      ) : (
        // Step 2: Time Selection
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="flex flex-col gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">اپراتور انتخاب شده:</h3>
            <div className="flex items-center gap-3">
              <Image
                src={selectedOperator?.avatar || ''}
                alt={selectedOperator?.name || ''}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <div className="font-medium">{selectedOperator?.name}</div>
                <div className="text-sm text-gray-500">{selectedOperator?.specialty}</div>
              </div>
            </div>
          </div>

          <input
            type="text"
            placeholder="عنوان رزرو"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              minDate={new DateObject({ calendar: persian, locale: persian_fa })}
            />
          </div>

          {selectedServices.length > 0 && selectedDate && (
            <div>
              <label className="mb-2 block font-medium">
                انتخاب زمان (مدت زمان مورد نیاز: {totalDuration} دقیقه):
              </label>
              
              {freeIntervals.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {freeIntervals.map((interval, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedInterval(interval)}
                      className={`p-2 border rounded cursor-pointer transition-colors text-center text-sm ${
                        selectedInterval?.start === interval.start
                          ? "bg-green-500 text-white border-green-500"
                          : "bg-white hover:bg-blue-50 border-gray-300 hover:border-blue-300"
                      }`}
                    >
                      <div className="font-medium">{interval.start}</div>
                      <div className="text-xs opacity-75">
                        {totalDuration}د
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 mb-3 text-sm">
                  برای این تاریخ تایم خالی وجود ندارد.
                  {suggestedDates.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">تاریخ‌های پیشنهادی:</p>
                      <div className="flex gap-2 mt-1">
                        {suggestedDates.map(date => (
                          <button
                            key={date}
                            type="button"
                            onClick={() => {
                              const dateObj = new DateObject({ date: new Date(date), calendar: persian, locale: persian_fa });
                              setSelectedDate(dateObj);
                            }}
                            className="px-2 py-1 bg-yellow-200 hover:bg-yellow-300 rounded text-xs"
                          >
                            {dayjs(date).locale('fa').format('DD MMM')}
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
            placeholder="توضیحات (اختیاری)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border rounded px-3 py-2"
          />

          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="outline" onClick={handleBackToOperatorSelection}>
              بازگشت
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              لغو
            </Button>
            <Button 
              type="submit"
              disabled={!title || !selectedDate || selectedServices.length === 0 || !selectedInterval || isSubmitting}
            >
              {isSubmitting ? "در حال ثبت..." : "ثبت رزرو"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
