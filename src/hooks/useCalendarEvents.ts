import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Category } from "./useCategories";
import { Task } from "./useTasks";
import { usePageLoader } from "@/providers/PageLoaderProvider";
import type { RecurringDeleteMode } from "@/components/ui/RecurringDeleteModal";

export type CalendarEvent = {
  id: string;
  user_id: string;
  task_id: string | null;
  category_id: string | null;
  title: string;
  start_time: string;
  end_time: string;
  status: "not_started" | "in_progress" | "completed" | "partial" | "skipped";
  completed_at: string | null;
  actual_minutes: number | null;
  notes: string | null;
  is_recurring: boolean;
  recurrence_rule: string | null;
  created_at: string;
  category?: Category;
  task?: Task;
  occurrence_start?: string;
  occurrence_end?: string;
};

export function useCalendarEvents(dateRange?: { start: string; end: string }) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { startLoading, stopLoading } = usePageLoader();

  const query = useQuery({
    queryKey: ["events", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("calendar_events")
        .select(`
          *,
          category:categories(*),
          task:tasks(*)
        `)
        .order("start_time", { ascending: true });

      if (dateRange?.start && dateRange?.end) {
        query = query.or(`and(start_time.lte.${dateRange.end},end_time.gte.${dateRange.start}),is_recurring.eq.true`);
      } else {
        if (dateRange?.start) {
          query = query.gte("start_time", dateRange.start);
        }
        if (dateRange?.end) {
          query = query.lte("end_time", dateRange.end);
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CalendarEvent[];
    },
  });

  const createMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async (newEvent: Omit<CalendarEvent, "id" | "user_id" | "created_at" | "category" | "task">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("calendar_events")
        .insert([{ ...newEvent, user_id: userData.user.id }])
        .select(`*, category:categories(*), task:tasks(*)`)
        .single();

      if (error) throw error;

      if (newEvent.status && newEvent.status !== "not_started" && newEvent.status !== "in_progress") {
        newEvent.completed_at = newEvent.start_time;
      }

      // Sync with task if completed
      if (newEvent.status && newEvent.status !== "not_started" && newEvent.task_id) {
        // Check if there is a recurring calendar event linked to this task
        const { data: recurringEvents } = await supabase
          .from("calendar_events")
          .select("id")
          .eq("task_id", newEvent.task_id)
          .eq("is_recurring", true);

        const isRecurringTask = recurringEvents && recurringEvents.length > 0;

        // Get the task's created_at to use as completed_at for the task
        const { data: linkedTask } = await supabase
          .from("tasks")
          .select("created_at")
          .eq("id", newEvent.task_id)
          .single();

        await supabase
          .from("tasks")
          .update({
            status: isRecurringTask ? "not_started" : newEvent.status,
            completed_at: linkedTask?.created_at || newEvent.start_time,
            actual_minutes: newEvent.actual_minutes
          })
          .eq("id", newEvent.task_id);
      }

      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async ({ id, ...updates }: Partial<CalendarEvent> & { id: string }) => {
      // First get current data to check if status or category actually changed
      const { data: currentData, error: currentError } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("id", id)
        .single();
        
      if (currentError) throw currentError;
      
      const statusChanged = updates.status !== undefined && updates.status !== currentData.status;
      const categoryChanged = updates.category_id !== undefined && updates.category_id !== currentData.category_id;

      const { category, task, ...cleanUpdates } = updates;

      if (statusChanged) {
        const isFinished = updates.status === "completed" || updates.status === "partial" || updates.status === "skipped";
        if (isFinished) {
          cleanUpdates.completed_at = currentData.start_time;
        }
      }
      
      const { data, error } = await supabase
        .from("calendar_events")
        .update(cleanUpdates)
        .eq("id", id)
        .select(`*, category:categories(*), task:tasks(*)`)
        .single();

      if (error) throw error;

      // Cross-sync: If category is being updated and there is a linked task, update the linked task's category
      if (categoryChanged && data.task_id) {
        await supabase
          .from("tasks")
          .update({ category_id: updates.category_id })
          .eq("id", data.task_id);
      }

      // Cross-sync: If status is being updated and there is a linked task
      if (statusChanged && data.task_id) {
        if (updates.status === "not_started") {
          // Check if this clone was for a recurring event. Only applies if the current event is NOT recurring itself.
          if (!data.is_recurring) {
            const { data: recurringEvents } = await supabase
              .from("calendar_events")
              .select("*")
              .eq("task_id", data.task_id)
              .eq("is_recurring", true);
              
            const recurringEvent = recurringEvents?.[0];
            
            if (recurringEvent) {
              // It's a recurring event clone being marked incomplete!
              // 1. Restore the recurrence rule on the original event (remove the EXDATE for this occurrence)
              const start = new Date(data.start_time);
              const exdateStr = start.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
              
              if (recurringEvent.recurrence_rule) {
                const rules = recurringEvent.recurrence_rule.split('\n');
                const updatedRules = rules.map((rule: string) => {
                  if (rule.startsWith('EXDATE:')) {
                    const dates = rule.substring(7).split(',');
                    const filteredDates = dates.filter((d: string) => !d.startsWith(exdateStr.slice(0, 8)));
                    return filteredDates.length > 0 ? `EXDATE:${filteredDates.join(',')}` : null;
                  }
                  return rule;
                }).filter(Boolean);
                
                await supabase
                  .from("calendar_events")
                  .update({ recurrence_rule: updatedRules.join('\n') })
                  .eq("id", recurringEvent.id);
              }
              
              // 2. Delete this clone event
              await supabase
                .from("calendar_events")
                .delete()
                .eq("id", id);
                
              // 3. Update the linked task to clear completed_at and actual_minutes
              await supabase
                .from("tasks")
                .update({
                  status: "not_started",
                  completed_at: null,
                  actual_minutes: null
                })
                .eq("id", data.task_id);
                
              return { ...data, id, status: "not_started" } as CalendarEvent;
            }
          }
        }

        // Check if there is a recurring calendar event linked to this task
        const { data: recurringEvents } = await supabase
          .from("calendar_events")
          .select("id")
          .eq("task_id", data.task_id)
          .eq("is_recurring", true);

        const isRecurringTask = recurringEvents && recurringEvents.length > 0;

        // Get the task's created_at to use as completed_at for the task
        const { data: linkedTask } = await supabase
          .from("tasks")
          .select("created_at")
          .eq("id", data.task_id)
          .single();

        // Standard update behavior (reverts status to not_started if recurring)
        await supabase
          .from("tasks")
          .update({
            status: (isRecurringTask && updates.status !== "not_started") ? "not_started" : updates.status,
            completed_at: updates.status !== "not_started" ? (linkedTask?.created_at || currentData.start_time) : null,
            actual_minutes: updates.status !== "not_started" ? updates.actual_minutes : null
          })
          .eq("id", data.task_id);
      }

      return data as CalendarEvent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("calendar_events").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

  const deleteRecurringMutation = useMutation({
    onMutate: () => {
      startLoading();
    },
    onSettled: () => {
      stopLoading();
    },
    mutationFn: async ({
      eventId,
      occurrenceDate,
      mode,
    }: {
      eventId: string;
      occurrenceDate: string;
      mode: RecurringDeleteMode;
    }) => {
      // Fetch the parent recurring event
      const { data: parentEvent, error: fetchErr } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("id", eventId)
        .single();
      if (fetchErr) throw fetchErr;

      const currentRule = parentEvent.recurrence_rule || "";

      if (mode.type === "this_instance") {
        // Add a single EXDATE for this occurrence
        const exdateStr = new Date(occurrenceDate).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const newRule = currentRule ? `${currentRule}\nEXDATE:${exdateStr}` : `EXDATE:${exdateStr}`;
        await supabase
          .from("calendar_events")
          .update({ recurrence_rule: newRule })
          .eq("id", eventId);
      } else if (mode.type === "all_of_day") {
        // Generate all occurrences of the specified weekday between fromDate and toDate
        // and add them as EXDATEs
        const { rrulestr } = await import("rrule");
        const dtstart = new Date(parentEvent.start_time).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        
        // Extract just the RRULE line (not EXDATE lines)
        const ruleLines = currentRule.split("\n");
        const rruleLine = ruleLines.find((l: string) => l.startsWith("FREQ=") || l.startsWith("RRULE:")) || ruleLines[0];
        const existingExdates = ruleLines.filter((l: string) => l.startsWith("EXDATE:"));
        
        const ruleStr = `DTSTART:${dtstart}\nRRULE:${rruleLine}`;
        const rule = rrulestr(ruleStr);

        const rangeStart = new Date(mode.fromDate + "T00:00:00");
        const rangeEnd = new Date(mode.toDate + "T23:59:59");
        const occurrences = rule.between(rangeStart, rangeEnd, true);

        // Map RRule weekday index to our RRULE BYDAY codes
        const jsWeekdayMap: Record<string, number> = {
          SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
        };
        const targetJsDay = jsWeekdayMap[mode.weekday];

        const newExdates: string[] = [];
        for (const occ of occurrences) {
          if (occ.getDay() === targetJsDay) {
            // Build the exdate using the parent event's original time but this occurrence's date
            const occStart = new Date(parentEvent.start_time);
            occStart.setFullYear(occ.getFullYear(), occ.getMonth(), occ.getDate());
            const exStr = occStart.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
            newExdates.push(exStr);
          }
        }

        if (newExdates.length > 0) {
          const exdateLine = `EXDATE:${newExdates.join(",")}`;
          const allParts = [rruleLine, ...existingExdates, exdateLine];
          await supabase
            .from("calendar_events")
            .update({ recurrence_rule: allParts.join("\n") })
            .eq("id", eventId);
        }
      } else if (mode.type === "all_forward") {
        // Truncate the recurrence: set UNTIL to the day before the occurrence
        const occDate = new Date(occurrenceDate);
        const dayBefore = new Date(occDate);
        dayBefore.setDate(dayBefore.getDate() - 1);
        dayBefore.setHours(23, 59, 59, 0);
        const untilStr = dayBefore.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        // Check if this is the first occurrence — if so, delete the entire event
        const { rrulestr } = await import("rrule");
        const dtstart = new Date(parentEvent.start_time).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const ruleLines = currentRule.split("\n");
        const rruleLine = ruleLines.find((l: string) => l.startsWith("FREQ=") || l.startsWith("RRULE:")) || ruleLines[0];
        const ruleStr = `DTSTART:${dtstart}\nRRULE:${rruleLine}`;
        const rule = rrulestr(ruleStr);

        const firstOcc = rule.after(new Date(0), true);
        if (firstOcc) {
          const firstOccDateStr = firstOcc.toISOString().split("T")[0];
          const occDateStr = occDate.toISOString().split("T")[0];
          if (firstOccDateStr >= occDateStr) {
            // The selected occurrence is at or before the first one — delete entirely
            await supabase.from("calendar_events").delete().eq("id", eventId);
            return eventId;
          }
        }

        // Update RRULE to have UNTIL = day before
        const existingExdates = ruleLines.filter((l: string) => l.startsWith("EXDATE:"));
        // Strip any existing UNTIL or COUNT from the rule
        const ruleSegments = rruleLine.split(";").filter(
          (seg: string) => !seg.startsWith("UNTIL=") && !seg.startsWith("COUNT=")
        );
        ruleSegments.push(`UNTIL=${untilStr}`);
        const newRuleLine = ruleSegments.join(";");
        
        // Keep existing EXDATEs that are before the new UNTIL
        const filteredExdates = existingExdates.filter((exLine: string) => {
          const dates = exLine.substring(7).split(",");
          const validDates = dates.filter((d: string) => {
            const exDate = new Date(d.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, "$1-$2-$3T$4:$5:$6Z"));
            return exDate <= dayBefore;
          });
          return validDates.length > 0;
        });

        const allParts = [newRuleLine, ...filteredExdates];
        await supabase
          .from("calendar_events")
          .update({ recurrence_rule: allParts.join("\n") })
          .eq("id", eventId);
      } else if (mode.type === "all_completely") {
        // Delete the parent recurring event
        await supabase.from("calendar_events").delete().eq("id", eventId);

        // Delete all completed clone events linked to the same task
        if (parentEvent.task_id) {
          await supabase
            .from("calendar_events")
            .delete()
            .eq("task_id", parentEvent.task_id)
            .eq("is_recurring", false);

          // Optionally delete the linked task
          if (mode.deleteTask) {
            await supabase.from("tasks").delete().eq("id", parentEvent.task_id);
          }
        }
      }

      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    events: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    createEvent: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateEvent: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteEvent: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    deleteRecurringEvent: deleteRecurringMutation.mutateAsync,
    isDeletingRecurring: deleteRecurringMutation.isPending,
  };
}
