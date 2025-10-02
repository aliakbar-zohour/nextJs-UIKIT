"use client";

import { useEffect, useState, useMemo } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Parser } from "json2csv";
import Button from "@/components/ui/Button/Button";
import Dropdown from "@/components/ui/DropDown/DropDown";
import { DownloadIcon, FileTextIcon, SearchIcon, FilterIcon, GridIcon } from "@/components/Icons/Icons";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);
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

  // Filter events based on search query
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    
    return events.filter(event => 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.extendedProps?.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.extendedProps?.user?.phone || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.extendedProps?.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.extendedProps?.services || []).some(service => 
        service.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [events, searchQuery]);

  const downloadCSV = () => {
    try {
      const mapped = events.map((ev) => ({
        "شناسه": ev.id,
        "عنوان": ev.title,
        "شروع": ev.start,
        "پایان": ev.end || "-",
        "رنگ": ev.color || "-",
        "کاربر": ev.extendedProps?.user?.name || "-",
        "تلفن": ev.extendedProps?.user?.phone || "-",
        "توضیحات": ev.extendedProps?.description || "-",
        "سرویس‌ها": ev.extendedProps?.services?.join("، ") || "-",
      }));

      const parser = new Parser({ fields: Object.keys(mapped[0] || {}) });
      const csv = parser.parse(mapped);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "رزروها.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV error:", err);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("public/fonts/YekanBakhFaNum-Regular.otf","yekan",10);
    doc.text("لیست رزروها", 14, 10);

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

    doc.save("رزروها.pdf");
  };

  const downloadDropdownItems = [
    {
      label: "دانلود CSV",
      value: "csv",
      icon: <FileTextIcon size={16} />
    },
    {
      label: "دانلود PDF", 
      value: "pdf",
      icon: <FileTextIcon size={16} />
    }
  ];

  const handleDownloadSelect = (item: { label: string; value?: any }) => {
    if (item.value === "csv") {
      downloadCSV();
    } else if (item.value === "pdf") {
      downloadPDF();
    }
    setShowDownloadDropdown(false);
  };

  const columns = [
    { key: "id", label: "شناسه" },
    { key: "title", label: "عنوان" },
    { key: "start", label: "شروع" },
    { key: "end", label: "پایان" },
    { key: "color", label: "رنگ" },
    { key: "user", label: "کاربر" },
    { key: "phone", label: "تلفن" },
    { key: "description", label: "توضیحات" },
    { key: "services", label: "سرویس‌ها" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-4 lg:p-6 font-sans">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <GridIcon className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">لیست رزروها</h1>
              <p className="text-gray-600 text-xs sm:text-sm">مدیریت و مشاهده تمام رزروها</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="جستجو در رزروها..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 sm:w-64 transition-all duration-200"
              />
            </div>
            
            {/* Download Dropdown */}
            <div className="relative">
              <Button 
                variant="outline" 
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className="flex items-center gap-2"
              >
                <DownloadIcon size={18} />
                دانلود
              </Button>
              
              {showDownloadDropdown && (
                <div className="absolute left-0 top-full mt-2 z-50">
                  <Dropdown
                    items={downloadDropdownItems}
                    onSelect={handleDownloadSelect}
                    isOpen={showDownloadDropdown}
                    onClose={() => setShowDownloadDropdown(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-600">کل رزروها: {events.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">نمایش داده شده: {filteredEvents.length}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-gray-500">در حال بارگذاری...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="max-h-[400px] sm:max-h-[500px] lg:max-h-[600px] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      onClick={() => setSelectedColumn(selectedColumn === column.key ? null : column.key)}
                      className={`border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-4 text-right font-semibold cursor-pointer transition-all duration-200 hover:bg-gray-200 text-xs sm:text-sm ${
                        selectedColumn === column.key
                          ? "bg-blue-100 text-blue-800 border-blue-300"
                          : "text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{column.label}</span>
                        {selectedColumn === column.key && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center py-12 text-gray-500">
                      <div className="flex flex-col items-center gap-3">
                        <FilterIcon size={48} className="text-gray-300" />
                        <p>هیچ رزروی یافت نشد</p>
                        {searchQuery && (
                          <p className="text-sm">جستجو برای: "{searchQuery}"</p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev, index) => (
                    <tr
                      key={ev.id}
                      className={`hover:bg-blue-50 transition-all duration-200 border-b border-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${selectedColumn === "id" ? "bg-blue-50 border-l-2 border-blue-300" : ""}`}>
                        <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{ev.id}</span>
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${selectedColumn === "title" ? "bg-blue-50 border-l-2 border-blue-300" : ""}`}>
                        <span className="font-medium text-gray-900">{ev.title}</span>
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${selectedColumn === "start" ? "bg-blue-50 border-l-2 border-blue-300" : ""}`}>
                        <span className="text-gray-600">{new Date(ev.start).toLocaleString('fa-IR')}</span>
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${selectedColumn === "end" ? "bg-blue-50 border-l-2 border-blue-300" : ""}`}>
                        <span className="text-gray-600">{ev.end ? new Date(ev.end).toLocaleString('fa-IR') : "-"}</span>
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${selectedColumn === "color" ? "bg-blue-50 border-l-2 border-blue-300" : ""}`}>
                        {ev.color ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: ev.color }}
                            ></div>
                            <span className="text-xs text-gray-500">{ev.color}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${selectedColumn === "user" ? "bg-blue-50 border-l-2 border-blue-300" : ""}`}>
                        <span className="text-gray-700">{ev.extendedProps?.user?.name || "-"}</span>
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${selectedColumn === "phone" ? "bg-blue-50 border-l-2 border-blue-300" : ""}`}>
                        <span className="text-gray-600 font-mono text-xs">{ev.extendedProps?.user?.phone || "-"}</span>
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${selectedColumn === "description" ? "bg-blue-50 border-l-2 border-blue-300" : ""}`}>
                        <span className="text-gray-600 text-xs">
                          {ev.extendedProps?.description ? 
                            (ev.extendedProps.description.length > 30 ? 
                              ev.extendedProps.description.substring(0, 30) + "..." : 
                              ev.extendedProps.description
                            ) : "-"
                          }
                        </span>
                      </td>
                      <td className={`px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm ${selectedColumn === "services" ? "bg-blue-50 border-l-2 border-blue-300" : ""}`}>
                        {ev.extendedProps?.services && ev.extendedProps.services.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {ev.extendedProps.services.map((service, i) => (
                              <span 
                                key={i}
                                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
