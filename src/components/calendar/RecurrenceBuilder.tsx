"use client";

import { useState, useEffect, useCallback } from "react";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";

type Frequency = "" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
type EndType = "never" | "on_date" | "after_count";

const WEEKDAYS = [
  { key: "MO", label: "Mon" },
  { key: "TU", label: "Tue" },
  { key: "WE", label: "Wed" },
  { key: "TH", label: "Thu" },
  { key: "FR", label: "Fri" },
  { key: "SA", label: "Sat" },
  { key: "SU", label: "Sun" },
] as const;

const FREQ_LABELS: Record<string, string> = {
  DAILY: "day",
  WEEKLY: "week",
  MONTHLY: "month",
  YEARLY: "year",
};

interface RecurrenceBuilderProps {
  value: string; // RRULE string or ""
  onChange: (rrule: string) => void;
  eventStartDate?: string; // ISO string of the event start, used for 3-month cap
}

// Compute a date 3 months from a given date
function add3Months(from: Date): Date {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 3);
  return d;
}

// Format a Date to RRULE UNTIL format (UTC): YYYYMMDDTHHMMSSZ
function toRRuleUntil(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// Format a Date to YYYY-MM-DD for date input
function toDateInputStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Parse an existing RRULE string into component state
function parseRRule(rrule: string) {
  const parts: Record<string, string> = {};
  rrule.split(";").forEach((segment) => {
    const [key, val] = segment.split("=");
    if (key && val) parts[key] = val;
  });

  const freq = (parts.FREQ || "") as Frequency;
  const interval = parseInt(parts.INTERVAL || "1", 10);
  const byDay = parts.BYDAY ? parts.BYDAY.split(",") : [];

  let endType: EndType = "never";
  let untilDate = "";
  let count = 10;

  if (parts.UNTIL) {
    endType = "on_date";
    // Parse YYYYMMDDTHHMMSSZ → YYYY-MM-DD
    const y = parts.UNTIL.slice(0, 4);
    const m = parts.UNTIL.slice(4, 6);
    const da = parts.UNTIL.slice(6, 8);
    untilDate = `${y}-${m}-${da}`;
  } else if (parts.COUNT) {
    endType = "after_count";
    count = parseInt(parts.COUNT, 10);
  }

  return { freq, interval, byDay, endType, untilDate, count };
}

export function RecurrenceBuilder({ value, onChange, eventStartDate }: RecurrenceBuilderProps) {
  const parsed = value ? parseRRule(value) : null;

  const [freq, setFreq] = useState<Frequency>(parsed?.freq || "");
  const [interval, setInterval] = useState(parsed?.interval || 1);
  const [byDay, setByDay] = useState<string[]>(parsed?.byDay || []);
  const [endType, setEndType] = useState<EndType>(parsed?.endType || "never");
  const [untilDate, setUntilDate] = useState(
    parsed?.untilDate || toDateInputStr(add3Months(eventStartDate ? new Date(eventStartDate) : new Date()))
  );
  const [count, setCount] = useState(parsed?.count || 10);

  // Build the RRULE string from state
  const buildRRule = useCallback(() => {
    if (!freq) return "";

    const parts: string[] = [`FREQ=${freq}`];

    if (interval > 1) {
      parts.push(`INTERVAL=${interval}`);
    }

    if (freq === "WEEKLY" && byDay.length > 0) {
      parts.push(`BYDAY=${byDay.join(",")}`);
    }

    if (endType === "on_date" && untilDate) {
      const d = new Date(untilDate + "T23:59:59Z");
      parts.push(`UNTIL=${toRRuleUntil(d)}`);
    } else if (endType === "after_count" && count > 0) {
      parts.push(`COUNT=${count}`);
    } else {
      // "Never" → auto-cap at 3 months
      const start = eventStartDate ? new Date(eventStartDate) : new Date();
      parts.push(`UNTIL=${toRRuleUntil(add3Months(start))}`);
    }

    return parts.join(";");
  }, [freq, interval, byDay, endType, untilDate, count, eventStartDate]);

  // Emit changes
  useEffect(() => {
    const newRule = buildRRule();
    if (newRule !== value) {
      onChange(newRule);
    }
  }, [buildRRule, onChange, value]);

  const toggleDay = (day: string) => {
    setByDay((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Frequency selector */}
      <Select
        label="Repeat"
        value={freq}
        onChange={(e) => {
          const newFreq = e.target.value as Frequency;
          setFreq(newFreq);
          if (newFreq !== "WEEKLY") setByDay([]);
        }}
        options={[
          { value: "", label: "Does not repeat" },
          { value: "DAILY", label: "Daily" },
          { value: "WEEKLY", label: "Weekly" },
          { value: "MONTHLY", label: "Monthly" },
          { value: "YEARLY", label: "Yearly" },
        ]}
      />

      {/* Expanded options — only shown when a frequency is selected */}
      {freq && (
        <div className="flex flex-col gap-3 pl-1 border-l-2 border-tempora-purple/30 ml-2 animate-in slide-in-from-top-2 duration-200">
          {/* Interval */}
          <div className="flex items-center gap-3 pl-3">
            <span className="text-sm text-white/60 whitespace-nowrap">Every</span>
            <input
              type="number"
              min={1}
              max={99}
              value={interval}
              onChange={(e) => setInterval(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple transition-all"
            />
            <span className="text-sm text-white/60">
              {FREQ_LABELS[freq] || ""}
              {interval > 1 ? "s" : ""}
            </span>
          </div>

          {/* Weekday picker (only for WEEKLY) */}
          {freq === "WEEKLY" && (
            <div className="flex flex-col gap-2 pl-3">
              <span className="text-sm font-medium text-white/60">On</span>
              <div className="flex gap-1.5 flex-wrap">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => toggleDay(day.key)}
                    className={`
                      w-10 h-10 rounded-lg text-xs font-semibold transition-all duration-200
                      ${
                        byDay.includes(day.key)
                          ? "bg-tempora-purple text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                          : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10 hover:text-white"
                      }
                    `}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* End condition */}
          <div className="flex flex-col gap-2 pl-3">
            <Select
              label="Ends"
              value={endType}
              onChange={(e) => setEndType(e.target.value as EndType)}
              options={[
                { value: "never", label: "Never (auto 3 months)" },
                { value: "on_date", label: "On date" },
                { value: "after_count", label: "After occurrences" },
              ]}
            />

            {endType === "on_date" && (
              <Input
                type="date"
                value={untilDate}
                onChange={(e) => setUntilDate(e.target.value)}
                label="End date"
              />
            )}

            {endType === "after_count" && (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={count}
                  onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center text-sm focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple transition-all"
                />
                <span className="text-sm text-white/60">occurrences</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
