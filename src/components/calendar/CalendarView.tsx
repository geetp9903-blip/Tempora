"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import rrulePlugin from "@fullcalendar/rrule";
import { useCalendarEvents, CalendarEvent } from "@/hooks/useCalendarEvents";
import { useCategories } from "@/hooks/useCategories";
import { CheckCircle2, AlertCircle, XCircle, Info } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { EventForm } from "./EventForm";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { CompletionModal } from "@/components/ui/CompletionModal";
import { RecurringDeleteModal, RecurringDeleteMode } from "@/components/ui/RecurringDeleteModal";
import { useEffect } from "react";
import { toast } from "sonner";

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null);
  const { categories } = useCategories();
  
  // State for fetching current view range
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString(), 
    end: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0).toISOString() 
  });
  
  const { events, createEvent, updateEvent, deleteEvent, deleteRecurringEvent, isDeletingRecurring } = useCalendarEvents(dateRange);

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
  const [recurringDeleteEvent, setRecurringDeleteEvent] = useState<{ event: CalendarEvent; occurrenceDate: string } | null>(null);
  const [completionEvent, setCompletionEvent] = useState<CalendarEvent | null>(null);

  const getEventDuration = (event: Partial<CalendarEvent>) => {
    const start = event.occurrence_start || event.start_time;
    const end = event.occurrence_end || event.end_time;
    if (!start || !end) return 30;
    return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
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
      setEditingEvent({
        ...event,
        occurrence_start: arg.event.start ? arg.event.start.toISOString() : undefined,
        occurrence_end: arg.event.end ? arg.event.end.toISOString() : (arg.event.start ? arg.event.start.toISOString() : undefined),
      });
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
    const catId = e.category_id || e.task?.category_id;
    const categoryObj = categories.find(c => c.id === catId);
    const catColor = categoryObj?.color || e.category?.color || "#7c3aed";

    const baseEvent = {
      id: e.id,
      title: e.title,
      backgroundColor: catColor,
      borderColor: "transparent",
      extendedProps: {
        status: e.status,
        taskId: e.task_id,
        categoryId: e.category_id,
        notes: e.notes || e.task?.description || "",
        priority: e.task?.priority || "",
        estimated_minutes: e.task?.estimated_minutes || e.actual_minutes || 0,
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

  const [infoEvent, setInfoEvent] = useState<any | null>(null);

  const renderEventContent = (eventInfo: any) => {
    const status = eventInfo.event.extendedProps.status;
    
    let StatusIcon = null;
    let statusColorClass = "";
    
    if (status === "completed") {
      StatusIcon = CheckCircle2;
      statusColorClass = "text-emerald-400";
    } else if (status === "partial") {
      StatusIcon = AlertCircle;
      statusColorClass = "text-amber-400";
    } else if (status === "skipped") {
      StatusIcon = XCircle;
      statusColorClass = "text-rose-400";
    }
    
    return (
      <div className="flex flex-col h-full w-full p-1 overflow-hidden text-xs text-white">
        <div className="flex items-center justify-between font-semibold leading-tight w-full">
          <div className="flex items-center gap-1 truncate pr-1">
            {StatusIcon && <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${statusColorClass}`} />}
            <span className="truncate">{eventInfo.event.title}</span>
          </div>
          <button 
            onPointerDown={(e) => {
              e.stopPropagation(); // prevent drag
              e.preventDefault(); // prevent click
              setInfoEvent({
                title: eventInfo.event.title,
                notes: eventInfo.event.extendedProps.notes,
                priority: eventInfo.event.extendedProps.priority,
                estimated_minutes: eventInfo.event.extendedProps.estimated_minutes,
                category_id: eventInfo.event.extendedProps.categoryId,
              });
            }}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            className="text-white/40 hover:text-white transition-colors shrink-0 p-0.5 rounded bg-black/20 hover:bg-black/40"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>
        {eventInfo.timeText && (
          <span className="text-[10px] text-white/80 mt-0.5 leading-none w-full truncate">{eventInfo.timeText}</span>
        )}
      </div>
    );
  };

  const handleDelete = async () => {
    if (deleteConfirmId) {
      await deleteEvent(deleteConfirmId);
      setDeleteConfirmId(null);
      setIsFormOpen(false);
    }
  };

  const handleRecurringDelete = async (mode: RecurringDeleteMode) => {
    if (!recurringDeleteEvent) return;
    try {
      await deleteRecurringEvent({
        eventId: recurringDeleteEvent.event.id,
        occurrenceDate: recurringDeleteEvent.occurrenceDate,
        mode,
      });
      toast.success("Recurring event updated successfully");
      setRecurringDeleteEvent(null);
      setIsFormOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete recurring event");
    }
  };

  const handleDeleteClick = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (event?.is_recurring && event.recurrence_rule) {
      // Use the occurrence date from the editing event, or fall back to the event start_time
      const occDate = editingEvent?.occurrence_start || event.start_time;
      setRecurringDeleteEvent({ event, occurrenceDate: occDate });
    } else {
      setDeleteConfirmId(eventId);
    }
  };

  const handleCompleteEvent = async ({ actualMinutes, notes, status, completedAt }: { actualMinutes: number, notes?: string, status: "completed" | "partial" | "skipped", completedAt: string }) => {
    if (completionEvent) {
      const startStr = completionEvent.occurrence_start || completionEvent.start_time;
      const endStr = completionEvent.occurrence_end || completionEvent.end_time;

      if (completionEvent.is_recurring && completionEvent.recurrence_rule) {
        // EXDATE format: YYYYMMDDTHHMMSSZ
        const exdateStr = new Date(startStr).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const origEvent = events.find(e => e.id === completionEvent.id);
        const newRRule = origEvent?.recurrence_rule 
          ? `${origEvent.recurrence_rule}\nEXDATE:${exdateStr}` 
          : `EXDATE:${exdateStr}`;

        await updateEvent({
          id: completionEvent.id,
          recurrence_rule: newRRule
        });

        // Create the completed clone using the occurrence's dates
        await createEvent({
          title: completionEvent.title,
          category_id: completionEvent.category_id,
          task_id: completionEvent.task_id, // Link to the same task
          start_time: startStr,
          end_time: endStr,
          notes: notes || completionEvent.notes,
          status: status,
          completed_at: completedAt,
          actual_minutes: actualMinutes,
          is_recurring: false,
          recurrence_rule: null
        });
      } else {
        await updateEvent({
          id: completionEvent.id,
          status: status,
          completed_at: completedAt,
          actual_minutes: actualMinutes,
          notes: notes || completionEvent.notes,
        });
      }
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
        eventContent={renderEventContent}
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
                  if (editingEvent.status && editingEvent.status !== "not_started") {
                    await updateEvent({ 
                      id: editingEvent.id!, 
                      status: "not_started", 
                      completed_at: null, 
                      actual_minutes: null 
                    });
                    setIsFormOpen(false);
                  } else {
                    setCompletionEvent(editingEvent as CalendarEvent);
                  }
                }}
                className={`${editingEvent.status && editingEvent.status !== "not_started" ? 'text-white/50 hover:text-white' : 'text-tempora-cyan hover:text-cyan-300'} text-sm font-medium transition-colors`}
              >
                {editingEvent.status && editingEvent.status !== "not_started" ? "Mark Not Started" : "Update Status"}
              </button>

              <button
                type="button"
                onClick={() => handleDeleteClick(editingEvent.id!)}
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

      {recurringDeleteEvent && (
        <RecurringDeleteModal
          isOpen={true}
          onClose={() => setRecurringDeleteEvent(null)}
          onConfirm={handleRecurringDelete}
          occurrenceDate={recurringDeleteEvent.occurrenceDate}
          recurrenceRule={recurringDeleteEvent.event.recurrence_rule || ""}
          eventTitle={recurringDeleteEvent.event.title}
          hasLinkedTask={!!recurringDeleteEvent.event.task_id}
          isLoading={isDeletingRecurring}
        />
      )}

      {completionEvent && (
        <CompletionModal
          isOpen={true}
          onClose={() => setCompletionEvent(null)}
          title={`Update Status: ${completionEvent.title}`}
          estimatedMinutes={getEventDuration(completionEvent)}
          defaultDate={completionEvent.occurrence_start || completionEvent.start_time}
          onSubmit={handleCompleteEvent}
        />
      )}

      <Modal
        isOpen={!!infoEvent}
        onClose={() => setInfoEvent(null)}
        title="Event Details"
      >
        {infoEvent && (
          <div className="flex flex-col gap-4 text-white">
            <div>
              <h4 className="text-lg font-semibold">{infoEvent.title}</h4>
              <div className="flex items-center gap-3 mt-2 text-sm text-white/60">
                {infoEvent.priority && <span className="capitalize px-2 py-1 rounded bg-white/10">{infoEvent.priority} Priority</span>}
                {infoEvent.estimated_minutes > 0 && <span>{infoEvent.estimated_minutes} min</span>}
                {infoEvent.category_id && categories.find(c => c.id === infoEvent.category_id) && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: categories.find(c => c.id === infoEvent.category_id)!.color }}
                    />
                    <span>{categories.find(c => c.id === infoEvent.category_id)!.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="h-px bg-white/10 w-full" />
            
            <div>
              <h5 className="text-sm font-medium text-white/50 mb-2">Notes & Description</h5>
              {infoEvent.notes ? (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 whitespace-pre-wrap text-sm text-white/80 leading-relaxed max-h-[300px] overflow-y-auto">
                  {infoEvent.notes}
                </div>
              ) : (
                <p className="text-white/40 italic text-sm p-2">No notes provided for this event.</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}


