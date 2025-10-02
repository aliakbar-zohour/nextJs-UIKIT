import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from "react";
import { EventContentArg } from "@fullcalendar/core";
import Calendar from "./Calendar";
import { EventType } from "@/app/types/types";
import { generateMockEvents, operators } from "@/lib/mockData";
import { ToastProvider } from '../Toast/ToastProvider';
import { useToastHelpers } from '../Toast/useToast';

const meta: Meta<typeof Calendar> = {
  title: "UI/Calendar",
  component: Calendar,
  decorators: [
    (Story) => (
      <ToastProvider maxToasts={3} defaultPosition="top-right">
        <Story />
      </ToastProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A comprehensive calendar component built on FullCalendar with Persian/Farsi support, dropdown interactions, and customizable views. Features include event management, operator filtering, and RTL layout support.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    events: {
      description: 'Array of events to display on the calendar',
      control: false,
      table: {
        type: { summary: 'EventType[]' },
      },
    },
    onEventClick: { 
      description: 'Callback when an event is clicked',
      action: "event clicked",
      table: {
        type: { summary: '(event: EventType) => void' },
      },
    },
    onAddEvent: { 
      description: 'Callback when "Add Event" is selected from dropdown',
      action: "add event",
      table: {
        type: { summary: '(date: string) => void' },
      },
    },
    onBlockDay: { 
      description: 'Callback when "Block Day" is selected from dropdown',
      action: "block day",
      table: {
        type: { summary: '(date: string) => void' },
      },
    },
    initialView: {
      description: 'Initial calendar view',
      control: "select",
      options: ["dayGridMonth", "timeGridWeek", "timeGridDay"],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'timeGridWeek' },
      },
    },
    firstDay: {
      description: 'First day of the week (0 = Sunday, 6 = Saturday)',
      control: "number",
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '6' },
      },
    },
    slotMinTime: { 
      description: 'Earliest time slot to display',
      control: "text",
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '08:00' },
      },
    },
    slotMaxTime: { 
      description: 'Latest time slot to display',
      control: "text",
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '20:00' },
      },
    },
    allDaySlot: { 
      description: 'Whether to display all-day slot',
      control: "boolean",
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    editable: { 
      description: 'Whether events are editable',
      control: "boolean",
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    slotDuration: { 
      description: 'Duration of each time slot',
      control: "text",
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: '00:05' },
      },
    },
    height: { 
      description: 'Calendar height',
      control: "text",
      table: {
        type: { summary: 'string | number' },
        defaultValue: { summary: 'auto' },
      },
    },
    locale: { 
      description: 'Calendar locale',
      control: "text",
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'fa' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample events with Persian content
const sampleEvents: EventType[] = [
  {
    id: "1",
    title: "جلسه تیمی",
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    color: "#f44336",
    extendedProps: { 
      operator: operators[0],
      services: ["جراحی بینی"],
      description: "جلسه هفتگی با تیم توسعه" 
    },
  },
  {
    id: "2",
    title: "رزرو مشاوره",
    start: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
    end: new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString(),
    color: "#2196f3",
    extendedProps: { 
      operator: operators[1],
      services: ["لیفت صورت"],
      description: "مشاوره اولیه با بیمار" 
    },
  },
  {
    id: "3",
    title: "جلسه آموزش",
    start: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(new Date().getTime() + 25 * 60 * 60 * 1000).toISOString(),
    color: "#4caf50",
    extendedProps: { 
      operator: operators[3],
      services: ["آموزش"],
      description: "آموزش تکنیک‌های جدید" 
    },
  },
];

// Interactive template with dropdown functionality
const InteractiveTemplate = ({ events = sampleEvents, ...args }: any) => {
  const toast = useToastHelpers();
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event);
    console.log('Event clicked:', event);
  };

  const handleAddEvent = (dateStr: string) => {
    console.log('Add event for date:', dateStr);
    toast.success(`اضافه کردن رویداد برای تاریخ: ${new Date(dateStr).toLocaleDateString('fa-IR')}`, {
      title: "رویداد جدید"
    });
  };

  const handleBlockDay = (dateStr: string) => {
    console.log('Block day:', dateStr);
    toast.warning(`بلاک کردن روز: ${new Date(dateStr).toLocaleDateString('fa-IR')}`, {
      title: "روز بلاک شد"
    });
  };

  return (
    <div className="p-4 h-screen">
      <Calendar
        {...args}
        events={events}
        onEventClick={handleEventClick}
        onAddEvent={handleAddEvent}
        onBlockDay={handleBlockDay}
      />
      
      {selectedEvent && (
        <div className="fixed top-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-sm" dir="rtl">
          <h3 className="font-bold text-lg mb-2">{selectedEvent.title}</h3>
          <p className="text-sm text-gray-600 mb-2">
            شروع: {new Date(selectedEvent.start).toLocaleString('fa-IR')}
          </p>
          {selectedEvent.end && (
            <p className="text-sm text-gray-600 mb-2">
              پایان: {new Date(selectedEvent.end).toLocaleString('fa-IR')}
            </p>
          )}
          <p className="text-sm">اپراتور: {selectedEvent.extendedProps.operator.name}</p>
          <button 
            onClick={() => setSelectedEvent(null)}
            className="mt-2 px-3 py-1 bg-gray-200 rounded text-sm"
          >
            بستن
          </button>
        </div>
      )}
    </div>
  );
};

// Basic calendar
export const Default: Story = {
  render: (args) => <InteractiveTemplate {...args} />,
  parameters: {
    docs: {
      description: {
        story: 'Default calendar with Persian events and dropdown functionality. Click on any date cell to see the dropdown menu.',
      },
    },
  },
};

// Month view
export const MonthView: Story = {
  render: (args) => <InteractiveTemplate {...args} initialView="dayGridMonth" />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar in month view showing all events for the month.',
      },
    },
  },
};

// Week view (default)
export const WeekView: Story = {
  render: (args) => <InteractiveTemplate {...args} initialView="timeGridWeek" />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar in week view with time slots and detailed event display.',
      },
    },
  },
};

// Day view
export const DayView: Story = {
  render: (args) => <InteractiveTemplate {...args} initialView="timeGridDay" />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar in day view focusing on a single day with hourly slots.',
      },
    },
  },
};

// Custom working hours
export const CustomHours: Story = {
  render: (args) => (
    <InteractiveTemplate 
      {...args} 
      slotMinTime="09:00:00"
      slotMaxTime="18:00:00"
      initialView="timeGridWeek"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with custom working hours (9 AM to 6 PM).',
      },
    },
  },
};

// With many events (using mock data)
export const WithManyEvents: Story = {
  render: (args) => <InteractiveTemplate {...args} events={generateMockEvents()} />,
  parameters: {
    docs: {
      description: {
        story: 'Calendar populated with many mock events to demonstrate performance and visual density.',
      },
    },
  },
};

// Read-only calendar
export const ReadOnly: Story = {
  render: (args) => <InteractiveTemplate {...args} editable={false} />,
  parameters: {
    docs: {
      description: {
        story: 'Read-only calendar where events cannot be edited or moved.',
      },
    },
  },
};

// Custom event rendering
export const CustomEventContent: Story = {
  render: (args) => (
    <InteractiveTemplate 
      {...args}
      eventContent={(arg: EventContentArg) => (
        <div className="p-1 text-xs" style={{ backgroundColor: arg.event.backgroundColor }}>
          <div className="font-bold">{arg.event.title}</div>
          <div className="opacity-75">
            {arg.event.extendedProps?.operator?.name}
          </div>
        </div>
      )}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with custom event rendering showing operator names.',
      },
    },
  },
};

// All-day events enabled
export const AllDaySlotEnabled: Story = {
  render: (args) => (
    <InteractiveTemplate 
      {...args} 
      allDaySlot={true}
      events={[
        ...sampleEvents,
        {
          id: "all-day-1",
          title: "تعطیلات",
          start: new Date().toISOString().split('T')[0], // All day event
          color: "#ff9800",
          extendedProps: { 
            operator: operators[0],
            services: [],
            description: "تعطیلات رسمی" 
          },
        }
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with all-day slot enabled for full-day events.',
      },
    },
  },
};

// English locale
export const EnglishLocale: Story = {
  render: (args) => (
    <InteractiveTemplate 
      {...args} 
      locale="en"
      firstDay={0} // Sunday
      events={[
        {
          id: "1",
          title: "Team Meeting",
          start: new Date().toISOString(),
          end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
          color: "#f44336",
          extendedProps: { 
            operator: { ...operators[0], name: "Dr. Smith" },
            services: ["Consultation"],
            description: "Weekly team meeting" 
          },
        },
        {
          id: "2",
          title: "Surgery",
          start: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
          end: new Date(new Date().getTime() + 4 * 60 * 60 * 1000).toISOString(),
          color: "#2196f3",
          extendedProps: { 
            operator: { ...operators[1], name: "Dr. Johnson" },
            services: ["Surgery"],
            description: "Scheduled surgery" 
          },
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Calendar with English locale and Sunday as first day of week.',
      },
    },
  },
};

// Compact view with small height
export const CompactView: Story = {
  render: (args) => (
    <InteractiveTemplate 
      {...args} 
      height={400}
      slotDuration="00:30"
      initialView="timeGridWeek"
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact calendar view with fixed height and 30-minute slots.',
      },
    },
  },
};

// Showcase of different views
export const ViewShowcase: Story = {
  render: () => {
    const [currentView, setCurrentView] = useState('timeGridWeek');
    const [events] = useState(sampleEvents);

    return (
      <div className="p-4 h-screen">
        <div className="mb-4 flex gap-2" dir="rtl">
          <button 
            onClick={() => setCurrentView('dayGridMonth')}
            className={`px-4 py-2 rounded ${currentView === 'dayGridMonth' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            نمای ماهانه
          </button>
          <button 
            onClick={() => setCurrentView('timeGridWeek')}
            className={`px-4 py-2 rounded ${currentView === 'timeGridWeek' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            نمای هفتگی
          </button>
          <button 
            onClick={() => setCurrentView('timeGridDay')}
            className={`px-4 py-2 rounded ${currentView === 'timeGridDay' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            نمای روزانه
          </button>
        </div>
        
        <Calendar
          events={events}
          initialView={currentView as any}
          onEventClick={(event) => console.log('Event clicked:', event)}
          onAddEvent={(date) => console.log(`اضافه کردن رویداد: ${date}`)}
          onBlockDay={(date) => console.log(`بلاک کردن روز: ${date}`)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive showcase allowing switching between different calendar views.',
      },
    },
  },
};

// Operator filtering demo
export const OperatorFiltering: Story = {
  render: () => {
    const [selectedOperator, setSelectedOperator] = useState<string>('');
    const [allEvents] = useState(generateMockEvents());
    
    const filteredEvents = selectedOperator 
      ? allEvents.filter(event => event.extendedProps.operator.id === selectedOperator)
      : allEvents;

    return (
      <div className="p-4 h-screen">
        <div className="mb-4" dir="rtl">
          <label className="block text-sm font-medium mb-2">فیلتر بر اساس اپراتور:</label>
          <select 
            value={selectedOperator} 
            onChange={(e) => setSelectedOperator(e.target.value)}
            className="border rounded px-3 py-2 text-right"
            dir="rtl"
          >
            <option value="">همه اپراتورها</option>
            {operators.map(op => (
              <option key={op.id} value={op.id}>{op.name} - {op.specialty}</option>
            ))}
          </select>
        </div>
        
        <Calendar
          events={filteredEvents}
          onEventClick={(event) => console.log('Event clicked:', event)}
          onAddEvent={(date) => console.log(`اضافه کردن رویداد: ${date}`)}
          onBlockDay={(date) => console.log(`بلاک کردن روز: ${date}`)}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Calendar with operator filtering functionality showing how to filter events by operator.',
      },
    },
  },
};