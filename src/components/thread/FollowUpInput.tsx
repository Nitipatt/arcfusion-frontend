"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface FollowUpInputProps {
  onSubmit: (query: string) => void;
  disabled?: boolean;
}

export function FollowUpInput({ onSubmit, disabled }: FollowUpInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSubmit(input.trim());
    setInput("");
  };

  return (
    <div className="fixed bottom-0 left-[72px] right-0 z-40 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pb-6 pt-8 px-8">
      <form
        onSubmit={handleSubmit}
        className="mx-auto max-w-3xl"
      >
        <div className="flex items-center overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200/60 transition-all focus-within:shadow-xl focus-within:ring-corporate-blue/30">
          <input
            id="followup-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask follow up..."
            disabled={disabled}
            className="flex-1 bg-transparent px-5 py-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || disabled}
            className="mr-2 flex h-8 w-8 items-center justify-center rounded-lg bg-corporate-blue text-white transition-all hover:bg-corporate-blue-dark disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
