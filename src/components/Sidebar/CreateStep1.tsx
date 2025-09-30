// components/Sidebar/CreateStep1.tsx
"use client";
import DatePicker from "react-multi-date-picker";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

interface Step1Props {
  newDate: string;
  setNewDate: (date: string) => void;
  newServices: string[];
  setNewServices: (services: string[]) => void;
  services: string[];
  onNext: () => void;
  onClose: () => void;
}

export default function CreateStep1({
  newDate,
  setNewDate,
  newServices,
  setNewServices,
  services,
  onNext,
  onClose,
}: Step1Props) {
  const timePickerPlugin = <TimePicker position="bottom" />;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-700">
        مرحله ۱: انتخاب زمان و سرویس‌ها
      </h2>

      <label className="block mb-2 text-sm text-gray-600">تاریخ رزرو</label>
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

      <label className="block mb-2 text-sm text-gray-600">سرویس‌ها</label>
      <div className="flex flex-wrap gap-2 mb-4">
        {services.map((s) => (
          <label
            key={s}
            className={`px-3 py-1 rounded-xl border cursor-pointer ${
              newServices.includes(s)
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            <input
              type="checkbox"
              value={s}
              checked={newServices.includes(s)}
              onChange={(e) => {
                if (e.target.checked) setNewServices([...newServices, s]);
                else setNewServices(newServices.filter((x) => x !== s));
              }}
              className="hidden"
            />
            {s}
          </label>
        ))}
      </div>

      <div className="flex justify-between mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
        >
          بستن
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600"
        >
          ادامه
        </button>
      </div>
    </div>
  );
}
