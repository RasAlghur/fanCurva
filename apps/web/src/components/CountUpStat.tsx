import { useCountUp } from "../hooks/useCountUp";

interface Props {
  value: string;
  suffix?: string;
  label: string;
  delay?: number;
}

export default function CountUpStat({
  value,
  suffix = "",
  label,
  delay = 400,
}: Props) {
  const numeric = parseFloat(value);
  const decimals = value.includes(".") ? value.split(".")[1].length : 0;

  const { value: count, ref } = useCountUp({
    end: numeric,
    decimals,
    delay,
  });

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-xl">
      {/* Top accent bar */}
      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-emerald-500/60" />

      {/* Bottom hover line - slides in on hover */}
      <div className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 bg-linear-to-r from-emerald-500 to-transparent group-hover:opacity-100" />

      {/* Animated shimmer overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Content */}
      <div
        ref={ref}
        className="relative flex flex-col items-center justify-center gap-2 px-6 py-8 text-center"
      >
        <div className="w-8 h-0.5 rounded-full bg-emerald-500/60 mb-1" />

        <div className="font-['Barlow_Condensed'] font-black text-[52px] md:text-[64px] text-white leading-none tracking-tight">
          {count.toFixed(decimals)}
          {suffix && <span className="text-emerald-400">{suffix}</span>}
        </div>

        <div className="text-white/40 text-[11px] uppercase tracking-[0.16em] font-medium">
          {label}
        </div>
      </div>
    </div>
  );
}
