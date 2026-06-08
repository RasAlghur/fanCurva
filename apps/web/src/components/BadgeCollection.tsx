/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";

const BADGE_TYPE_ICON: Record<string, string> = {
  match_day: "⚽",
  trivia: "🧠",
  referral: "🤝",
  watch_party: "🏠",
  team: "🌍",
  starter: "🎫",
  knockout: "🏆",
  default: "🏅",
};

// All known badge types for the filter bar
const ALL_TYPES = [
  "match_day",
  "trivia",
  "referral",
  "watch_party",
  "team",
  "starter",
  "knockout",
];

function typeLabel(t: string) {
  return t.replace(/_/g, " ");
}

interface Badge {
  id: string;
  name: string;
  badge_type: string;
  locked?: boolean;
  [key: string]: any;
}

interface Props {
  badges: Badge[];
  /** Optional: show locked placeholder badges from this list */
  lockedBadges?: Badge[];
}

export default function BadgeCollection({ badges, lockedBadges = [] }: Props) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Determine which filter tabs to show — only types that exist in earned OR locked
  const presentTypes = useMemo(() => {
    const all = [...badges, ...lockedBadges].map((b) => b.badge_type);
    return ALL_TYPES.filter((t) => all.includes(t));
  }, [badges, lockedBadges]);

  const earnedFiltered = useMemo(
    () =>
      activeFilter
        ? badges.filter((b) => b.badge_type === activeFilter)
        : badges,
    [badges, activeFilter],
  );

  const lockedFiltered = useMemo(
    () =>
      activeFilter
        ? lockedBadges.filter((b) => b.badge_type === activeFilter)
        : lockedBadges,
    [lockedBadges, activeFilter],
  );

  const allVisible = [...earnedFiltered, ...lockedFiltered];

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-xl animate-slide-up">
      {/* Top accent bar */}
      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-emerald-500/60" />

      {/* Bottom hover line - slides in on hover */}
      <div className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 bg-linear-to-r from-emerald-500 to-transparent group-hover:opacity-100" />

      {/* Animated shimmer overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Content */}
      <div className="relative p-6 md:p-7">
        {/* header */}
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Collected
            </span>
            <h3 className="font-['Barlow_Condensed'] text-[28px] font-extrabold uppercase tracking-[0.03em] text-white">
              My Badges
            </h3>
          </div>
          <span className="text-[11px] uppercase tracking-[0.2em] text-white/30">
            {badges.length} earned
          </span>
        </div>

        {/* filter pills — only rendered if there are multiple types */}
        {presentTypes.length > 1 && (
          <div
            className="mb-4 flex flex-wrap gap-2"
            role="group"
            aria-label="Filter badges"
          >
            <button
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition-all ${
                activeFilter === null
                  ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-400"
                  : "border border-white/10 text-white/40 hover:border-emerald-500/30 hover:text-white/70"
              }`}
              onClick={() => setActiveFilter(null)}
            >
              All
            </button>
            {presentTypes.map((t) => (
              <button
                key={t}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-widest transition-all ${
                  activeFilter === t
                    ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-400"
                    : "border border-white/10 text-white/40 hover:border-emerald-500/30 hover:text-white/70"
                }`}
                onClick={() => setActiveFilter(activeFilter === t ? null : t)}
              >
                {BADGE_TYPE_ICON[t] ?? BADGE_TYPE_ICON.default} {typeLabel(t)}
              </button>
            ))}
          </div>
        )}

        {/* empty state */}
        {allVisible.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/10 py-14 text-center">
            <span className="mb-3 block text-4xl opacity-50">🏅</span>
            <p className="font-['Barlow_Condensed'] text-xl font-extrabold uppercase tracking-[0.06em] text-white/30">
              No Badges Yet
            </p>
            <p className="mt-1 text-sm text-white/25">
              Complete quests to earn your first badge.
            </p>
          </div>
        )}

        {/* grid */}
        {allVisible.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
            {allVisible.map((b) => (
              <div
                key={b.id}
                className={`relative rounded-xl border p-4 text-center transition-all ${
                  b.locked
                    ? "border-white/5 bg-[#0d1a14]/50 opacity-40 grayscale"
                    : "border-white/10 bg-[#0d1a14] hover:border-emerald-500/30 hover:bg-[#0f1e16] hover:-translate-y-0.5"
                }`}
                title={b.locked ? "Locked — complete more quests" : b.name}
              >
                {b.locked && (
                  <span
                    className="absolute right-1.5 top-1.5 text-[10px] opacity-50"
                    aria-hidden="true"
                  >
                    🔒
                  </span>
                )}
                <span
                  className="mb-2 block text-2xl leading-none"
                  aria-hidden="true"
                >
                  {BADGE_TYPE_ICON[b.badge_type] ?? BADGE_TYPE_ICON.default}
                </span>
                <p className="font-['Barlow_Condensed'] text-[11px] font-bold uppercase tracking-[0.07em] text-white">
                  {b.locked ? "???" : b.name}
                </p>
                <span className="mt-1 block text-[9px] uppercase tracking-[0.18em] text-white/30">
                  {typeLabel(b.badge_type)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
