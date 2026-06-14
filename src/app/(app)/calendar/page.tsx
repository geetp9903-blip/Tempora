import { CalendarView } from "@/components/calendar/CalendarView";

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Calendar</h2>
        <p className="text-white/60 mt-1">Schedule your time and events.</p>
      </div>

      <div className="flex-1 min-h-[600px]">
        <CalendarView />
      </div>
    </div>
  );
}
