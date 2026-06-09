import { useCallback, useEffect, useState } from "react";

interface CTASectionProps {
  onCTA: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCountdown(target: Date): TimeLeft {
  const calc = useCallback((): TimeLeft => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }, [target]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calc);

  useEffect(() => {
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  return timeLeft;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="font-display font-black text-[52px] md:text-[64px] text-white leading-none tracking-tight">
        {String(value).padStart(2, "0")}
      </div>
      <div className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-medium">
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div className="font-display font-black text-[40px] text-white/20 leading-none pb-4">
      :
    </div>
  );
}

export default function CTASection({ onCTA }: CTASectionProps) {
  const { days, hours, minutes, seconds } = useCountdown(
    new Date("2026-06-11T00:00:00Z"),
  );

  return (
    <section className="relative py-28 px-6 md:px-12 overflow-hidden pitch-texture">
      <div className="absolute inset-0 bg-radial-[ellipse_70%_60%_at_50%_50%] from-[#1D9E75]/12 to-transparent pointer-events-none" />

      {/* top edge accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-[#1D9E75]/30" />

      <div className="relative mx-auto text-center max-w-3xl flex flex-col items-center">
        <p className="text-[#1D9E75] text-xs tracking-[0.25em] uppercase font-semibold mb-5">
          World Cup 2026 starts in
        </p>

        {/* countdown */}
        <div className="flex items-end gap-3 md:gap-5 mb-12">
          <CountdownUnit value={days} label="Days" />
          <Divider />
          <CountdownUnit value={hours} label="Hours" />
          <Divider />
          <CountdownUnit value={minutes} label="Minutes" />
          <Divider />
          <CountdownUnit value={seconds} label="Seconds" />
        </div>

        <h2 className="font-display font-black text-[48px] md:text-[76px] text-white leading-[0.9] tracking-tight mb-5">
          THE WORLD CUP
          <br />
          <span className="text-[#e8c44a]">IS YOURS.</span>
        </h2>

        <p className="text-white/50 text-base max-w-md leading-relaxed mb-10">
          Free to join. No crypto needed. Sign up in under 2 minutes and mint
          your Fan Passport before the opening match.
        </p>

        <button
          onClick={onCTA}
          className="w-full sm:w-auto font-display font-black text-base sm:text-lg md:text-xl tracking-wide px-6 sm:px-10 md:px-14 py-3 sm:py-4 md:py-5 rounded-2xl bg-white text-emerald-800 hover:bg-white/90 transition-all duration-150 shadow-lg hover:shadow-xl active:scale-95"
        >
          GET YOUR FREE PASSPORT →
        </button>

        <p className="text-white/30 text-[11px] tracking-widest uppercase mt-8">
          USA · Canada · Mexico · June 11 – July 19
        </p>
      </div>
    </section>
  );
}
