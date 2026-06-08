const POINT_ACTIONS = [
  { action: "Match check-in", pts: "20 pts", icon: "📺" },
  { action: "Correct prediction", pts: "30 pts", icon: "🎯" },
  { action: "Trivia streak ×5", pts: "+50 pts", icon: "🧠" },
  { action: "Host watch party", pts: "60 pts", icon: "🏠" },
  { action: "Mint passport", pts: "100 pts", icon: "🎫" },
  { action: "Invite a friend", pts: "75 pts", icon: "🤝" },
  { action: "Match reaction", pts: "15 pts", icon: "📣" },
  { action: "Collect badge", pts: "25 pts", icon: "🏅" },
];

const TIERS = [
  {
    tier: "Supporter",
    range: "0 – 499 pts",
    label: "Entry",
    icon: "🎮",
    color: "#888",
    bg: "#1a1a1a",
  },
  {
    tier: "True Fan",
    range: "500 – 1,499 pts",
    label: "Active",
    icon: "⚽",
    color: "#1D9E75",
    bg: "#0f1f18",
  },
  {
    tier: "Ultras",
    range: "1,500 – 3,499 pts",
    label: "Elite",
    icon: "🔥",
    color: "#e8a020",
    bg: "#1a1508",
  },
  {
    tier: "Legend",
    range: "3,500+ pts",
    label: "Rare",
    icon: "👑",
    color: "#e05c7a",
    bg: "#1a0d12",
  },
];

export default function RewardsGrid() {
  return (
    <section
      id="rewards"
      className="py-28 px-6 md:px-12 bg-[#0a0e0b] border-y border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div>
            <p className="text-[#1D9E75] text-xs tracking-[0.25em] uppercase font-semibold mb-3">
              Rewards
            </p>
            <h2 className="font-display font-black text-[52px] md:text-[64px] text-white leading-none tracking-tight">
              EARN EVERY
              <br />
              <span className="text-gold">MOMENT.</span>
            </h2>
          </div>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            Over 200 badges across 64 matches. Every action earns points. Every
            badge is yours to keep forever.
          </p>
        </div>

        {/* points table */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {POINT_ACTIONS.map(({ action, pts, icon }) => (
            <div
              key={action}
              className="card-hover rounded-xl border border-white/6 bg-[#0d1410] px-4 py-4 flex items-center gap-3"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="text-[#1D9E75] font-display font-bold text-base">
                  {pts}
                </p>
                <p className="text-white/40 text-xs leading-tight">{action}</p>
              </div>
            </div>
          ))}
        </div>

        {/* tier badges */}
        <div className="rounded-2xl border border-white/8 bg-[#0d1410] p-6 md:p-8">
          <p className="text-white/30 text-xs tracking-widest uppercase mb-6">
            Status tiers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TIERS.map(({ tier, range, label, icon, color, bg }) => (
              <div
                key={tier}
                className="relative rounded-2xl px-5 py-5 border flex flex-col gap-3 overflow-hidden group card-hover"
                style={{ backgroundColor: bg, borderColor: `${color}30` }}
              >
                {/* background glow blob */}
                <div
                  className="absolute -top-4 -right-4 w-16 h-16 rounded-full blur-2xl opacity-30"
                  style={{ backgroundColor: color }}
                />

                {/* top row: icon + label pill */}
                <div className="flex items-center justify-between relative">
                  <span className="text-2xl">{icon}</span>
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {label}
                  </span>
                </div>

                {/* tier name */}
                <div className="relative">
                  <p className="font-display font-black text-xl text-white leading-none">
                    {tier}
                  </p>
                  <p
                    className="text-[11px] mt-1.5"
                    style={{ color: `${color}99` }}
                  >
                    {range}
                  </p>
                </div>

                {/* bottom accent line */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{
                    background: `linear-gradient(to right, ${color}60, transparent)`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
