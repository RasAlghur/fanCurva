interface NeutralFanCalloutProps {
  onCTA: () => void;
}

export default function NeutralFanCallout({ onCTA }: NeutralFanCalloutProps) {
  return (
    <section className="py-10 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="relative rounded-2xl border border-[#1D9E75]/20 bg-[#0d1a14] px-8 py-8 md:py-10 flex flex-col md:flex-row items-start md:items-center gap-6 overflow-hidden">
        {/* left accent border */}
        <div className="absolute left-0 top-6 bottom-6 w-0.75 rounded-full bg-[#1D9E75]/60" />

        {/* subtle background glow */}
        <div className="absolute left-0 top-0 bottom-0 w-48 bg-[#1D9E75]/5 pointer-events-none blur-2xl" />

        {/* icon container */}
        <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-[#1D9E75]/10 border border-[#1D9E75]/20 flex items-center justify-center">
          <span className="text-2xl">🌍</span>
        </div>

        {/* copy */}
        <div className="relative flex-1">
          <p className="font-display font-bold text-white text-xl md:text-2xl mb-1.5 leading-tight">
            Your team got knocked out?{" "}
            <span className="text-[#1D9E75]">You're still in.</span>
          </p>
          <p className="text-white/40 text-sm leading-relaxed max-w-xl">
            Neutral Fan Mode unlocks automatically when your team is eliminated.
            Back an underdog, track golden boot contenders, collect semi-final
            and final badges — every fan stays in the game, right to the last
            whistle.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={onCTA}
          className="relative shrink-0 font-display font-bold text-sm px-7 py-3.5 rounded-xl bg-[#1D9E75] text-white hover:opacity-90 transition-opacity duration-150 tracking-wide"
        >
          JOIN FREE →
        </button>
      </div>
    </section>
  );
}
