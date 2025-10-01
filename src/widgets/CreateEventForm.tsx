"use client";
import { useEffect, useState } from "react";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { UserType } from "@/app/types/types";
import Button from "@/components/ui/Button/Button";
import UserFilter from "@/components/Calendar/UserFilter";

interface CreateFormProps {
  users: UserType[];
  services: string[];
  onClose: () => void;
  onSave: (data: {
    date: string;
    services: string[];
    user: UserType | null;
    desc: string;
  }) => void;
}

export default function CreateEventForm({
  users,
  services,
  onClose,
  onSave,
}: CreateFormProps) {
  const [step, setStep] = useState(1);
  const [newDate, setNewDate] = useState("");
  const [newServices, setNewServices] = useState<string[]>([]);
  const [newUser, setNewUser] = useState<UserType | null>(null);
  const [newDesc, setNewDesc] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const d = new Date();
    d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0);
    setNewDate(d.toISOString());
  }, []);

  const timePickerPlugin = <TimePicker position="bottom" />;

  const saveEvent = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const payload = {
        start: newDate,
        end: newDate,
        title: newServices.join(", ") || "بدون عنوان",
        extendedProps: { user: newUser, desc: newDesc, services: newServices },
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("خطا در ذخیره اطلاعات");
      }

      onSave({
        date: newDate,
        services: newServices,
        user: newUser,
        desc: newDesc,
      });

 
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 h-full">
      {step === 1 && (
        <div className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              مرحله ۱: انتخاب زمان و سرویس‌ها
            </h2>
            <label className="block mb-2 text-sm text-gray-600">
              تاریخ رزرو
            </label>
            <DatePicker
              value={newDate}
              onChange={(date: any) => {
                if (!date) return;
                const d = date.toDate();
                d.setMinutes(Math.round(d.getMinutes() / 5) * 5, 0, 0);
                setNewDate(d.toISOString());
              }}
              format="YYYY/MM/DD HH:mm"
              calendar={persian}
              locale={persian_fa}
              plugins={[timePickerPlugin]}
              className="border p-2 rounded-xl w-full mb-4"
            />
            <label className="block mb-2 text-sm text-gray-600">خدمات</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {services.map((s) => (
                <label
                  key={s}
                  className={`px-3 py-1 rounded-xl border cursor-pointer ${
                    newServices.includes(s)
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  <input
                    type="checkbox"
                    value={s}
                    checked={newServices.includes(s)}
                    onChange={(e) =>
                      setNewServices(
                        e.target.checked
                          ? [...newServices, s]
                          : newServices.filter((x) => x !== s)
                      )
                    }
                    className="hidden"
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="secondary"
              className="w-full py-3"
            >
              بستن
            </Button>
            <Button
              onClick={() => setStep(2)}
              variant="primary"
              className="w-full py-3"
            >
              ادامه
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col justify-between h-full">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              مرحله ۲: انتخاب کاربر
            </h2>
            <UserFilter
              users={users}
              onSelect={(u: any) => setNewUser(u)}
              hideList={!!newUser}
            />
            <label className="block mb-2 text-sm text-gray-600">توضیحات</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="border p-2 rounded-xl w-full mb-4"
            />
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              className="w-full py-3"
              loading={loading}
            >
              قبلی
            </Button>
            <Button
              variant="primary"
              onClick={saveEvent}
              className="w-full py-3 flex items-center justify-center"
              loading={loading}
            >
              {loading ? "در حال ذخیره..." : "ذخیره"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
