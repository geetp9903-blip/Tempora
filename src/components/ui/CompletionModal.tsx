"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";

export type CompletionStatus = "completed" | "partial" | "skipped";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  estimatedMinutes?: number;
  defaultDate?: string;
  onSubmit: (data: { actualMinutes: number; notes?: string; status: CompletionStatus; completedAt: string }) => void;
}

export function CompletionModal({
  isOpen,
  onClose,
  title = "Update Task Status",
  estimatedMinutes = 30,
  defaultDate,
  onSubmit,
}: CompletionModalProps) {
  const [actualMinutes, setActualMinutes] = useState(estimatedMinutes.toString());
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<CompletionStatus>("completed");
  const [completedDate, setCompletedDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActualMinutes(estimatedMinutes.toString());
      setNotes("");
      setStatus("completed");
      if (defaultDate) {
        setCompletedDate(defaultDate.split('T')[0]);
      } else {
        setCompletedDate(new Date().toISOString().split('T')[0]);
      }
    }
  }, [isOpen, estimatedMinutes, defaultDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMinutes = parseInt(actualMinutes);
    // Use the selected date and attach the current time
    const selectedDateObj = new Date(completedDate);
    const now = new Date();
    selectedDateObj.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
    
    onSubmit({
      actualMinutes: isNaN(parsedMinutes) ? estimatedMinutes : parsedMinutes,
      notes: notes.trim() || undefined,
      status,
      completedAt: selectedDateObj.toISOString()
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <p className="text-white/70 text-sm mb-2">
          Update the status of this task.
        </p>
        
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/80 ml-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as CompletionStatus)}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple transition-all duration-200 appearance-none"
          >
            <option value="completed" className="bg-gray-800">Completed (As Planned)</option>
            <option value="partial" className="bg-gray-800">Partially Completed (Not Enough Time)</option>
            <option value="skipped" className="bg-gray-800">Skipped (Not Performed)</option>
          </select>
        </div>
        
        <Input
          label="Completion Date"
          type="date"
          required
          value={completedDate}
          onChange={(e) => setCompletedDate(e.target.value)}
        />

        <Input
          label={status === "skipped" ? "Time Spent (minutes)" : "Actual Time (minutes)"}
          type="number"
          min="0"
          required
          value={actualMinutes}
          onChange={(e) => setActualMinutes(e.target.value)}
          autoFocus={status !== "skipped"}
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-white/80 ml-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any blockers or insights?"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-tempora-purple/50 focus:border-tempora-purple transition-all duration-200 resize-none h-24"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-white/10">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Confirm
          </Button>
        </div>
      </form>
    </Modal>
  );
}
