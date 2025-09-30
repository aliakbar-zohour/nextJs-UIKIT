// Calendar.stories.tsx
import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import Calendar, { CalendarProps, EventType } from "./Calendar";
import { EventContentArg } from "@fullcalendar/core";

export default {
  title: "Components/Calendar",
  component: Calendar,
  argTypes: {
    onEventClick: { action: "event clicked" },
    initialView: {
      control: "select",
      options: ["dayGridMonth", "timeGridWeek", "timeGridDay"],
    },
    firstDay: {
      control: "number",
      description: "First day of the week (0 = Sunday)",
    },
    slotMinTime: { control: "text" },
    slotMaxTime: { control: "text" },
    allDaySlot: { control: "boolean" },
    editable: { control: "boolean" },
    slotDuration: { control: "text" },
    height: { control: "text" },
    locale: { control: "text" },
  },
} as Meta<typeof Calendar>;

const sampleEvents: EventType[] = [
  {
    id: "1",
    title: "جلسه تیمی",
    start: new Date().toISOString(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
    color: "#f44336",
    extendedProps: { description: "جلسه هفتگی با تیم توسعه" },
  },
  {
    id: "2",
    title: "مرخصی",
    start: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
    color: "#2196f3",
  },
];

const Template: StoryFn<CalendarProps> = (args) => <Calendar {...args} />;

export const Default = Template.bind({});
Default.args = { events: sampleEvents };

export const MonthView = Template.bind({});
MonthView.args = { events: sampleEvents, initialView: "dayGridMonth" };

export const WeekView = Template.bind({});
WeekView.args = { events: sampleEvents, initialView: "timeGridWeek" };

export const DayView = Template.bind({});
DayView.args = { events: sampleEvents, initialView: "timeGridDay" };

export const CustomHours = Template.bind({});
CustomHours.args = {
  events: sampleEvents,
  slotMinTime: "09:00:00",
  slotMaxTime: "18:00:00",
};

export const EditableEvents = Template.bind({});
EditableEvents.args = { events: sampleEvents, editable: true };

export const ReadOnlyEvents = Template.bind({});
ReadOnlyEvents.args = { events: sampleEvents, editable: false };

export const CustomEventContent = Template.bind({});
CustomEventContent.args = {
  events: sampleEvents,
  eventContent: (arg: EventContentArg) => (
    <div style={{ padding: "2px", backgroundColor: arg.event.backgroundColor }}>
      <strong>{arg.event.title}</strong>
      {arg.event.extendedProps?.description && (
        <div style={{ fontSize: "0.8em" }}>
          {arg.event.extendedProps.description}
        </div>
      )}
    </div>
  ),
};

export const AllDaySlotEnabled = Template.bind({});
AllDaySlotEnabled.args = { events: sampleEvents, allDaySlot: true };

export const CustomFirstDay = Template.bind({});
CustomFirstDay.args = { events: sampleEvents, firstDay: 0 }; // Sunday

export const CustomHeight = Template.bind({});
CustomHeight.args = { events: sampleEvents, height: 800 };

export const PersianLocale = Template.bind({});
PersianLocale.args = { events: sampleEvents, locale: "fa" };
