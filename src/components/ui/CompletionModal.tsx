"use client";

import { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Input } from "./Input";
import { Button } from "./Button";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  estimatedMinutes?: number;
  onSubmit: (data: { actualMinutes: number; notes?: string }) => void;
}

export function CompletionModal({
  isOpen,
  onClose,
  title = "Mark as Completed",
  estimatedMinutes = 30,
  onSubmit,
}: CompletionModalProps) {
  const [actualMinutes, setActualMinutes] = useState(estimatedMinutes.toString());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      setActualMinutes(estimatedMinutes.toString());
      setNotes("");
    }
  }, [isOpen, estimatedMinutes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedMinutes = parseInt(actualMinutes);
    onSubmit({
      actualMinutes: isNaN(parsedMinutes) ? estimatedMinutes : parsedMinutes,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <p className="text-white/70 text-sm mb-2">
          Great job! Let's record how long this actually took.
        </p>

        <Input
          label="Actual Time (minutes)"
          type="number"
          min="1"
          required
          value={actualMinutes}
          onChange={(e) => setActualMinutes(e.target.value)}
          autoFocus
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
            Confirm Completion
          </Button>
        </div>
      </form>
    </Modal>
  );
}
