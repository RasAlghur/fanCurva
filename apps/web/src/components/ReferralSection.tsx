import { useState } from "react";

interface ReferralLink {
  referral_url: string;
  total_referrals: number;
  points_earned: number;
  next_referral_worth?: number;
}

interface Props {
  referralLink: ReferralLink;
}

export default function ReferralSection({ referralLink }: Props) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(referralLink.referral_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const nextWorth = referralLink.next_referral_worth ?? 75;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-xl animate-fade-in">
      {/* Top accent bar */}
      <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-emerald-500/60" />

      {/* Bottom hover line - slides in on hover */}
      <div className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 bg-linear-to-r from-emerald-500 to-transparent group-hover:opacity-100" />

      {/* Animated shimmer overlay on hover */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Content */}
      <div className="relative p-6 md:p-7">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Earn {nextWorth} pts per signup
            </span>
            <h3 className="font-['Barlow_Condensed'] text-[28px] font-extrabold uppercase tracking-[0.03em] text-white">
              Your Referral Link
            </h3>
          </div>
          {/* <span className="text-2xl leading-none" aria-hidden="true">
            🤝
          </span> */}
        </div>

        {/* URL + copy */}
        <div className="flex items-center gap-2.5">
          <div
            className="flex-1 min-w-0 rounded-lg border border-white/10 bg-[#080c0a] px-4 py-2.5 font-mono text-sm text-emerald-400 whitespace-nowrap overflow-hidden text-ellipsis"
            title={referralLink.referral_url}
          >
            {referralLink.referral_url}
          </div>
          <button
            onClick={handleCopy}
            className={`shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap ${
              copied
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border border-emerald-500/50 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white"
            }`}
          >
            {copied ? "✓ Copied!" : "Copy"}
          </button>
        </div>

        {/* Stats row */}
        {(referralLink.total_referrals > 0 ||
          referralLink.points_earned > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-6 pt-4 border-t border-white/5">
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/30">
                Referred
              </span>
              <span className="font-['Barlow_Condensed'] text-2xl font-extrabold text-white">
                {referralLink.total_referrals}
              </span>
            </div>
            <div>
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/30">
                Pts Earned
              </span>
              <span className="font-['Barlow_Condensed'] text-2xl font-extrabold text-emerald-400">
                {referralLink.points_earned.toLocaleString()}
              </span>
            </div>
            <div className="ml-auto text-right">
              <span className="block text-[10px] uppercase tracking-[0.2em] text-white/30">
                Next Referral
              </span>
              <span className="font-['Barlow_Condensed'] text-2xl font-extrabold text-emerald-400">
                +{nextWorth} pts
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
