"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { Modal } from "@/components/ui/Modal";
import { EventForm } from "./EventForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CompletionModal } from "@/components/ui/CompletionModal";
import { useEffect } from "react";

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null);
  
  // State for fetching current view range
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(), 
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString() 
  });
  
  const { events, updateEvent, deleteEvent } = useCalendarEvents(dateRange);

  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string | undefined>(undefined);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | undefined>(undefined);
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [completionEvent, setCompletionEvent] = useState<CalendarEvent | null>(null);

  const getEventDuration = (event: Partial<CalendarEvent>) => {
    if (!event.start_time || !event.end_time) return 30;
    return Math.max(1, Math.round((new Date(event.end_time).getTime() - new Date(event.start_time).getTime()) / 60000));
  };

  // Handle clicking on a date cell to create a new event
  const handleDateClick = (arg: { date: Date; dateStr: string }) => {
    setEditingEvent(undefined);
    setSelectedDateStr(arg.date.toISOString());
    setIsFormOpen(true);
  };

  // Handle clicking on an existing event
  const handleEventClick = (arg: { event: any }) => {
    const eventId = arg.event.id;
    const event = events.find(e => e.id === eventId);
    if (event) {
      setEditingEvent(event);
      setIsFormOpen(true);
    }
  };

  // Handle dragging an event to a new time/day
  const handleEventDrop = async (arg: { event: any; oldEvent: any; revert: () => void }) => {
    try {
      const eventId = arg.event.id;
      await updateEvent({
        id: eventId,
        start_time: arg.event.start.toISOString(),
        end_time: arg.event.end ? arg.event.end.toISOString() : arg.event.start.toISOString(),
      });
    } catch (err) {
      arg.revert();
    }
  };

  // Handle resizing an event
  const handleEventResize = async (arg: { event: any; oldEvent: any; revert: () => void }) => {
    try {
      const eventId = arg.event.id;
      await updateEvent({
        id: eventId,
        end_time: arg.event.end.toISOString(),
      });
    } catch (err) {
      arg.revert();
    }
  };

  // Format events for FullCalendar
  const calendarEvents = events.map(e => {
    const baseEvent = {
      id: e.id,
      title: e.title,
      backgroundColor: e.category?.color || "#7c3aed",
      borderColor: "transparent",
      extendedProps: {
        isCompleted: e.completed,
        taskId: e.task_id,
        categoryId: e.category_id,
      }
    };

    if (e.is_recurring && e.recurrence_rule) {
      const dtstart = new Date(e.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      const durationMs = new Date(e.end_time).getTime() - new Date(e.start_time).getTime();
      const hours = Math.floor(durationMs / 3600000);
      const minutes = Math.floor((durationMs % 3600000) / 60000);
      const durationStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      return {
        ...baseEvent,
        rrule: `DTSTART:${dtstart}\nRRULE:${e.recurrence_rule}`,
        duration: durationStr
      };
    }

    return {
      ...baseEvent,
      start: e.start_time,
      end: e.end_time,
    };
  });

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteEvent(deleteConfirmId);
      setDeleteConfirmId(null);
      setIsFormOpen(false);
    }
  };

  const handleCompleteEvent = async ({ actualMinutes, notes }: { actualMinutes: number, notes?: string }) => {
    if (completionEvent) {
      await updateEvent({
        id: completionEvent.id,
        completed: true,
        completed_at: new Date().toISOString(),
        actual_minutes: actualMinutes,
        notes: notes || completionEvent.notes,
      });
      setCompletionEvent(null);
      setIsFormOpen(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 overflow-hidden calendar-wrapper">
      {/* We use a global CSS override in globals.css for fullcalendar styles to match our dark theme */}
      <FullCalendar
        key={isMobile ? 'mobile' : 'desktop'}
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, rrulePlugin]}
        initialView={isMobile ? "timeGridDay" : "timeGridWeek"}
        headerToolbar={{
          left: isMobile ? "prev,next" : "prev,next today",
          center: "title",
          right: isMobile ? "dayGridMonth,timeGridDay" : "dayGridMonth,timeGridWeek,timeGridDay"
        }}
        events={calendarEvents}
        editable={true}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        height="75vh"
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        nowIndicator={true}
        datesSet={(arg) => {
          // Update fetch range when view changes
          setDateRange({
            start: arg.start.toISOString(),
            end: arg.end.toISOString()
          });
        }}
      />

      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEvent?.id ? "Edit Event" : "New Event"}
      >
        <div className="flex flex-col gap-4">
          <EventForm 
            initialData={editingEvent}
            selectedDateStr={selectedDateStr}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
          
          {editingEvent?.id && (
            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
              <button
                type="button"
                onClick={async () => {
                  if (editingEvent.completed) {
                    await updateEvent({ 
                      id: editingEvent.id!, 
                      completed: false, 
                      completed_at: null, 
                      actual_minutes: null 
                    });
                    setIsFormOpen(false);
                  } else {
                    setCompletionEvent(editingEvent as CalendarEvent);
                  }
                }}
                className={`${editingEvent.completed ? 'text-white/50 hover:text-white' : 'text-tempora-cyan hover:text-cyan-300'} text-sm font-medium transition-colors`}
              >
                {editingEvent.completed ? "Mark Incomplete" : "Mark Completed"}
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirmId(editingEvent.id!)}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Delete Event
              </button>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        description="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        isDestructive
      />

      {completionEvent && (
        <CompletionModal
          isOpen={true}
          onClose={() => setCompletionEvent(null)}
          title={`Complete: ${completionEvent.title}`}
          estimatedMinutes={getEventDuration(completionEvent)}
          onSubmit={handleCompleteEvent}
        />
      )}
    </div>
  );
}
