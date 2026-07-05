"use client";

import { useState, useMemo } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { Trash2, Calendar, ArrowRight, XCircle } from "lucide-react";

const WEEKDAY_MAP: Record<string, string> = {
  MO: "Monday",
  TU: "Tuesday",
  WE: "Wednesday",
  TH: "Thursday",
  FR: "Friday",
  SA: "Saturday",
  SU: "Sunday",
};

const WEEKDAY_OPTIONS = [
  { value: "MO", label: "Monday" },
  { value: "TU", label: "Tuesday" },
  { value: "WE", label: "Wednesday" },
  { value: "TH", label: "Thursday" },
  { value: "FR", label: "Friday" },
  { value: "SA", label: "Saturday" },
  { value: "SU", label: "Sunday" },
];

export type RecurringDeleteMode =
  | { type: "this_instance" }
  | { type: "all_of_day"; weekday: string; fromDate: string; toDate: string }
  | { type: "all_forward" }
  | { type: "all_completely"; deleteTask: boolean };

interface RecurringDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (mode: RecurringDeleteMode) => void;
  occurrenceDate: string;
  recurrenceRule: string;
  eventTitle: string;
  hasLinkedTask: boolean;
  isLoading?: boolean;
}

function getWeekdayFromDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dayIndex = d.getDay(); // 0=Sun, 1=Mon, ...
  const map = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
  return map[dayIndex];
}

function parseUntilDate(rrule: string): string | null {
  // Parse UNTIL from an RRULE string (could have EXDATE lines separated by \n)
  const lines = rrule.split("\n");
  for (const line of lines) {
    const segments = line.split(";");
    for (const seg of segments) {
      if (seg.startsWith("UNTIL=")) {
        const until = seg.substring(6);
        // YYYYMMDDTHHMMSSZ → YYYY-MM-DD
        const y = until.slice(0, 4);
        const m = until.slice(4, 6);
        const d = until.slice(6, 8);
        return `${y}-${m}-${d}`;
      }
    }
  }
  return null;
}

function toDateInputStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function RecurringDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  occurrenceDate,
  recurrenceRule,
  eventTitle,
  hasLinkedTask,
  isLoading = false,
}: RecurringDeleteModalProps) {
  const [selectedOption, setSelectedOption] = useState<1 | 2 | 3 | 4>(1);

  // Option 2 state
  const autoWeekday = useMemo(() => getWeekdayFromDate(occurrenceDate), [occurrenceDate]);
  const [weekday, setWeekday] = useState(autoWeekday);
  const [fromDate, setFromDate] = useState(toDateInputStr(new Date()));
  const untilDate = useMemo(() => parseUntilDate(recurrenceRule), [recurrenceRule]);
  const defaultToDate = untilDate || toDateInputStr(new Date(new Date().setMonth(new Date().getMonth() + 3)));
  const [toDate, setToDate] = useState(defaultToDate);

  // Option 4 state
  const [deleteTask, setDeleteTask] = useState(false);

  const handleConfirm = () => {
    switch (selectedOption) {
      case 1:
        onConfirm({ type: "this_instance" });
        break;
      case 2:
        onConfirm({ type: "all_of_day", weekday, fromDate, toDate });
        break;
      case 3:
        onConfirm({ type: "all_forward" });
        break;
      case 4:
        onConfirm({ type: "all_completely", deleteTask });
        break;
    }
  };

  const options = [
    {
      id: 1 as const,
      icon: XCircle,
      title: "Delete This Instance Only",
      description: `Remove only the occurrence on ${new Date(occurrenceDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}.`,
    },
    {
      id: 2 as const,
      icon: Calendar,
      title: "Delete All Instances of a Day",
      description: "Remove all occurrences of a specific weekday within a date range.",
    },
    {
      id: 3 as const,
      icon: ArrowRight,
      title: "Delete All Forward Instances",
      description: `End the recurrence before ${new Date(occurrenceDate).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}. Past events remain.`,
    },
    {
      id: 4 as const,
      icon: Trash2,
      title: "Delete All Instances Completely",
      description: "Remove every occurrence including past completed events.",
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={isLoading}>
            Delete
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col items-center text-center pt-2 pb-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-red-500/10 text-red-500">
            <Trash2 className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-1">Delete Recurring Event</h3>
          <p className="text-white/50 text-sm">&ldquo;{eventTitle}&rdquo;</p>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = selectedOption === opt.id;
            return (
              <div key={opt.id}>
                <button
                  type="button"
                  onClick={() => setSelectedOption(opt.id)}
                  className={`
                    w-full text-left p-3 rounded-xl border transition-all duration-200
                    ${
                      isSelected
                        ? "bg-red-500/10 border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
                        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/15"
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Radio indicator */}
                    <div className={`
                      mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                      ${isSelected ? "border-red-500 bg-red-500" : "border-white/30"}
                    `}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? "text-red-400" : "text-white/40"}`} />
                        <span className={`text-sm font-medium ${isSelected ? "text-white" : "text-white/70"}`}>
                          {opt.title}
                        </span>
                      </div>
                      <p className="text-xs text-white/40 mt-1 ml-6">{opt.description}</p>
                    </div>
                  </div>
                </button>

                {/* Option 2 expanded fields */}
                {opt.id === 2 && isSelected && (
                  <div className="mt-2 ml-7 p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-3 animate-in slide-in-from-top-2 duration-200">
                    {/* Weekday selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-white/60">Weekday</label>
                      <div className="flex gap-1.5 flex-wrap">
                        {WEEKDAY_OPTIONS.map((day) => (
                          <button
                            key={day.value}
                            type="button"
                            onClick={() => setWeekday(day.value)}
                            className={`
                              px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                              ${
                                weekday === day.value
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
                              }
                            `}
                          >
                            {day.label.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date range */}
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        type="date"
                        label="From"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                      />
                      <Input
                        type="date"
                        label="To"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                      />
                    </div>

                    <p className="text-[11px] text-white/30">
                      All {WEEKDAY_MAP[weekday]} occurrences between these dates will be removed.
                    </p>
                  </div>
                )}

                {/* Option 4 expanded fields */}
                {opt.id === 4 && isSelected && hasLinkedTask && (
                  <div className="mt-2 ml-7 p-3 rounded-xl bg-white/[0.03] border border-white/10 animate-in slide-in-from-top-2 duration-200">
                    <label className="flex items-center gap-2.5 cursor-pointer group">
                      <div className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                        ${deleteTask 
                          ? "bg-red-500 border-red-500" 
                          : "border-white/30 group-hover:border-white/50"
                        }
                      `}>
                        {deleteTask && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="checkbox"
                        checked={deleteTask}
                        onChange={(e) => setDeleteTask(e.target.checked)}
                        className="sr-only"
                      />
                      <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
                        Also delete the linked task
                      </span>
                    </label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
