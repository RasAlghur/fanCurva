const STEPS = [
  {
    step: "01",
    icon: "🎫",
    title: "MINT YOUR PASSPORT",
    body: "Sign up with your email — no crypto needed. Pick your national team. Your free digital passport is created instantly.",
    accent: "#1D9E75",
  },
  {
    step: "02",
    icon: "⚡",
    title: "COMPLETE QUESTS",
    body: "Check in to live matches, answer trivia, make predictions, invite friends, and host watch parties to earn points.",
    accent: "#e8a020",
  },
  {
    step: "03",
    icon: "🏅",
    title: "COLLECT & CLIMB",
    body: "Earn unique badges for every action. Watch your rank climb. Every badge and point is yours — permanently on-chain.",
    accent: "#5865f2",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <p className="text-[#1D9E75] text-xs tracking-[0.25em] uppercase font-semibold mb-3">
          How it works
        </p>
        <h2 className="font-display font-black text-[56px] md:text-[76px] text-white leading-none tracking-tight">
          THREE STEPS.
          <br />
          <span className="text-[#e8c44a]">ONE PASSPORT.</span>
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map(({ step, icon, title, body, accent }) => (
          <div
            key={step}
            className="group relative overflow-hidden rounded-2xl border border-white/8 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 p-7 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-white/15 hover:shadow-emerald-500/10 hover:shadow-xl"
          >
            {/* Top accent bar */}
            <div
              className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
              style={{ background: `${accent}60` }}
            />

            {/* Bottom hover line - slides in on hover */}
            <div
              className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `linear-gradient(to right, ${accent}, transparent)`,
              }}
            />

            {/* Animated shimmer overlay on hover */}
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative flex items-start justify-between mb-6 mt-2">
              <span
                className="font-display font-black text-[64px] leading-none select-none"
                style={{ color: `${accent}35` }}
              >
                {step}
              </span>
              <span className="text-3xl">{icon}</span>
            </div>

            <h3 className="relative font-display font-bold text-xl text-white mb-3 tracking-wide">
              {title}
            </h3>

            <p className="relative text-white/55 text-sm leading-relaxed font-light">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
