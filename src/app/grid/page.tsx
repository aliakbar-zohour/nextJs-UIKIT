"use client";

import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Parser } from "json2csv";
import Sidebar from "@/components/ui/SideBar/Sidebar";
import Button from "@/components/ui/Button/Button";

export interface UserType {
  id: string;
  name: string;
  phone?: string;
}

export interface EventType {
  id: string;
  title: string;
  start: string;
  end?: string;
  color?: string;
  extendedProps?: {
    user?: UserType;
    description?: string;
    services?: string[];
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openSidebar, setOpenSidebar] = useState(false);

  const toggleSidebar = () => {
    setOpenSidebar((perv) => !perv);
  };
  // fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const downloadCSV = () => {
    try {
      const mapped = events.map((ev) => ({
        شناسه: ev.id,
        عنوان: ev.title,
        شروع: ev.start,
        پایان: ev.end || "-",
        رنگ: ev.color || "-",
        کاربر: ev.extendedProps?.user?.name || "-",
        تلفن: ev.extendedProps?.user?.phone || "-",
        توضیحات: ev.extendedProps?.description || "-",
        سرویس‌ها: ev.extendedProps?.services?.join("، ") || "-",
      }));

      const parser = new Parser({ fields: Object.keys(mapped[0] || {}) });
      const csv = parser.parse(mapped);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "ایونت‌ها.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV error:", err);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("vazir", "normal");
    doc.text("لیست ایونت‌ها", 14, 10);

    const tableData = events.map((ev) => [
      ev.id,
      ev.title,
      ev.start,
      ev.end || "-",
      ev.color || "-",
      ev.extendedProps?.user?.name || "-",
      ev.extendedProps?.user?.phone || "-",
      ev.extendedProps?.description || "-",
      ev.extendedProps?.services?.join("، ") || "-",
    ]);

    autoTable(doc, {
      head: [
        [
          "شناسه",
          "عنوان",
          "شروع",
          "پایان",
          "رنگ",
          "کاربر",
          "تلفن",
          "توضیحات",
          "سرویس‌ها",
        ],
      ],
      body: tableData,
    });

    doc.save("ایونت‌ها.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="w-full flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">لیست ایونت‌ها</h1>
        <Button variant="outline" onClick={toggleSidebar}>دانلود</Button>
      </div>

      {loading ? (
        <p className="text-gray-500">در حال بارگذاری...</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded shadow">
          <div className="max-h-[500px] overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="border px-3 py-2 text-left">شناسه</th>
                  <th className="border px-3 py-2 text-left">عنوان</th>
                  <th className="border px-3 py-2 text-left">شروع</th>
                  <th className="border px-3 py-2 text-left">پایان</th>
                  <th className="border px-3 py-2 text-left">رنگ</th>
                  <th className="border px-3 py-2 text-left">کاربر</th>
                  <th className="border px-3 py-2 text-left">تلفن</th>
                  <th className="border px-3 py-2 text-left">توضیحات</th>
                  <th className="border px-3 py-2 text-left">سرویس‌ها</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr
                    key={ev.id}
                    className="even:bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <td className="border px-3 py-2">{ev.id}</td>
                    <td className="border px-3 py-2">{ev.title}</td>
                    <td className="border px-3 py-2">{ev.start}</td>
                    <td className="border px-3 py-2">{ev.end || "-"}</td>
                    <td className="border px-3 py-2">{ev.color || "-"}</td>
                    <td className="border px-3 py-2">
                      {ev.extendedProps?.user?.name || "-"}
                    </td>
                    <td className="border px-3 py-2">
                      {ev.extendedProps?.user?.phone || "-"}
                    </td>
                    <td className="border px-3 py-2">
                      {ev.extendedProps?.description || "-"}
                    </td>
                    <td className="border px-3 py-2">
                      {ev.extendedProps?.services?.join("، ") || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Sidebar isOpen={openSidebar} onClose={toggleSidebar}>
        <div className="flex gap-4 mb-4 items-center justify-stretch">
          <Button
            onClick={downloadCSV}
            variant="secondary"
            className="w-full py-3"
          >
            دانلود CSV
          </Button>
          <Button
            onClick={downloadPDF}
            variant="outline"
            className="w-full py-3"
          
          >
            دانلود PDF
          </Button>
        </div>
      </Sidebar>
    </div>
  );
}
