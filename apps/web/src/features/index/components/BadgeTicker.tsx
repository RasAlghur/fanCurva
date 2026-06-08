import BadgeHexagon from "../../../components/BadgeHexagon";

const BADGES = [
  { icon: "⚽", label: "Match Day", accent: "#1D9E75", state: "earned" },
  { icon: "🏆", label: "Knockout", accent: "#e8a020", state: "earned" },
  { icon: "🎯", label: "Trivia", accent: "#5865f2", state: "new" },
  { icon: "🤝", label: "Referral", accent: "#e05c7a", state: "earned" },
  { icon: "🌍", label: "Host City", accent: "#1D9E75", state: "earned" },
  { icon: "🔥", label: "Hot Streak", accent: "#e8a020", state: "locked" },
  { icon: "🥇", label: "Golden Boot", accent: "#FFD700", state: "earned" },
  { icon: "📍", label: "Watch Party", accent: "#5865f2", state: "new" },
  { icon: "🛡️", label: "Clean Sheet", accent: "#4A9EFF", state: "earned" },
  { icon: "⚡", label: "First Goal", accent: "#C084FC", state: "locked" },
  { icon: "🎉", label: "Opening Day", accent: "#1D9E75", state: "earned" },
  { icon: "🌟", label: "Fan Favourite", accent: "#e8a020", state: "earned" },
] as const;

export default function BadgeTicker() {
  const doubled = [...BADGES, ...BADGES];

  return (
    <div className="py-12 overflow-hidden">
      {/* section label */}
      <p className="text-center text-[#1D9E75] text-xs tracking-[0.25em] uppercase font-semibold mb-10">
        200+ badges to earn
      </p>

      {/* fade edges */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-r from-[#080d0b] to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-linear-to-l from-[#080d0b] to-transparent" />

        {/* scrolling track — uses .badge-ticker CSS class, same pattern as working ticker */}
        <div className="badge-ticker">
          {doubled.map((badge, i) => (
            <BadgeHexagon
              key={i}
              icon={badge.icon}
              label={badge.label}
              accent={badge.accent}
              state={badge.state}
              size={56}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
