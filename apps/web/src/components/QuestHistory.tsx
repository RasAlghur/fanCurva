/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";

const QUEST_ICON: Record<string, string> = {
  match_day: "⚽",
  trivia: "🧠",
  referral: "🤝",
  watch_party: "🏠",
  team: "🌍",
  starter: "🎫",
  knockout: "🏆",
  default: "✅",
};

interface QuestEntry {
  id: string;
  quest_name: string;
  quest_type?: string;
  points_earned: number;
  completed_at: string;
  [key: string]: any;
}

interface Props {
  quests: QuestEntry[];
}

export default function QuestHistory({ quests }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-xl animate-fade-in">
      {/* Top accent bar */}
      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-emerald-500/60" />

      {/* Bottom hover line - slides in on hover */}
      <div className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 bg-linear-to-r from-emerald-500 to-transparent group-hover:opacity-100" />

      {/* Animated shimmer overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Content */}
      <div className="relative">
        {/* toggle button */}
        <button
          className="w-full px-6 py-5 text-left transition-colors hover:bg-white/5"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <span className="block text-[10.5px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
                History
              </span>
              <h3 className="font-['Barlow_Condensed'] text-[22px] font-extrabold uppercase tracking-[0.03em] text-white">
                Quest History
              </h3>
              <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-white/30">
                {quests.length} completed
              </span>
            </div>

            <span
              className={`flex size-5.5 shrink-0 items-center justify-center rounded-full border border-white/30 transition-all ${
                open
                  ? "rotate-180 border-emerald-500/35 text-emerald-400"
                  : "text-white"
              }`}
              aria-hidden="true"
            >
              <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                <path
                  d="M3 4.5L6 7.5L9 4.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>
        </button>

        {/* collapsible body */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            open ? "max-h-9999px opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-white/5">
            {quests.length === 0 && (
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-white/30">
                  No completed quests yet. Start playing to earn points!
                </p>
              </div>
            )}

            {quests.map((q) => (
              <div
                key={q.id}
                className="flex items-center gap-3.5 border-b border-white/5 px-6 py-3 transition-colors hover:bg-white/5 last:border-b-0"
              >
                {/* icon */}
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-sm"
                  aria-hidden="true"
                >
                  {QUEST_ICON[q.quest_type ?? "default"] ?? QUEST_ICON.default}
                </div>

                {/* name + date */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {q.quest_name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-white/30">
                    {new Date(q.completed_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* points */}
                <span className="shrink-0 font-['Barlow_Condensed'] text-lg font-extrabold text-emerald-400">
                  +{q.points_earned.toLocaleString()} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
