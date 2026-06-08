/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { questsApi, pointsApi, leaderboardApi, badgesApi } from "../../lib/api";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  points_reward: number;
  expires_at: string | null;
}

interface Points {
  total_points: number;
  rank_overall: number;
  rank_team: number;
}

interface LeaderboardEntry {
  display_name: string;
  points: number;
  rank: number;
  id?: string;
}

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  home_flag?: string;
  away_flag?: string;
  kickoff_time: string;
  stadium?: string;
  is_live?: boolean;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; label: string; accent: string }
> = {
  supporter: {
    color: "#888780",
    bg: "rgba(136,135,128,0.1)",
    border: "rgba(136,135,128,0.3)",
    label: "Supporter",
    accent: "#888780",
  },
  true_fan: {
    color: "#4A9EFF",
    bg: "rgba(74,158,255,0.1)",
    border: "rgba(74,158,255,0.3)",
    label: "True Fan",
    accent: "#4A9EFF",
  },
  ultras: {
    color: "#C084FC",
    bg: "rgba(192,132,252,0.1)",
    border: "rgba(192,132,252,0.3)",
    label: "Ultras",
    accent: "#C084FC",
  },
  legend: {
    color: "#FFD700",
    bg: "rgba(255,215,0,0.1)",
    border: "rgba(255,215,0,0.3)",
    label: "Legend",
    accent: "#FFD700",
  },
};

const QUEST_ICONS: Record<string, string> = {
  match_checkin: "📺",
  trivia: "🧠",
  prediction: "🎯",
  watch_party: "🏠",
  referral: "🤝",
  default: "⚡",
};

// Helper to get flag emoji from country name (simple mapping)
const getFlagEmoji = (country: string): string => {
  const flags: Record<string, string> = {
    Brazil: "🇧🇷",
    France: "🇫🇷",
    Argentina: "🇦🇷",
    England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    Spain: "🇪🇸",
    Germany: "🇩🇪",
    Italy: "🇮🇹",
    Netherlands: "🇳🇱",
    Portugal: "🇵🇹",
    Belgium: "🇧🇪",
    USA: "🇺🇸",
    Mexico: "🇲🇽",
    Canada: "🇨🇦",
    Japan: "🇯🇵",
    Korea: "🇰🇷",
    Australia: "🇦🇺",
    Nigeria: "🇳🇬",
    Ghana: "🇬🇭",
    Senegal: "🇸🇳",
    Morocco: "🇲🇦",
    Egypt: "🇪🇬",
    Saudi: "🇸🇦",
    Iran: "🇮🇷",
  };
  return flags[country] || "🏆";
};

// ── CSS Animations (injected via style tag) ───────────────────────────────────

const animationStyles = `
  @keyframes db-fly-up {
    0% { opacity: 1; transform: translateY(0) scale(1); }
    60% { opacity: 1; transform: translateY(-60px) scale(1.1); }
    100% { opacity: 0; transform: translateY(-120px) scale(0.85); }
  }
  
  @keyframes db-spin {
    to { transform: rotate(360deg); }
  }
  
  @keyframes db-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }
  
  @keyframes db-toast-in {
    from { opacity: 0; transform: translateX(24px) scale(0.95); }
    to { opacity: 1; transform: translateX(0) scale(1); }
  }
  
  .animate-fly-up {
    animation: db-fly-up 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  
  .animate-spin-slow {
    animation: db-spin 0.65s linear infinite;
  }
  
  .animate-pulse-slow {
    animation: db-pulse 1.4s ease infinite;
  }
  
  .animate-toast-in {
    animation: db-toast-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
`;

// Inject styles once
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = animationStyles;
  document.head.appendChild(styleSheet);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatCountdown(expiresAt: string | null): {
  label: string;
  urgent: boolean;
} {
  if (!expiresAt) return { label: "", urgent: false };
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return { label: "Expired", urgent: true };
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h < 1) return { label: `${m}m left`, urgent: true };
  if (h < 3) return { label: `${h}h ${m}m left`, urgent: true };
  return { label: `${h}h left`, urgent: false };
}

function sortByExpiry(quests: Quest[]): Quest[] {
  return [...quests].sort((a, b) => {
    if (!a.expires_at) return 1;
    if (!b.expires_at) return -1;
    return new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime();
  });
}

// ── Points particle animation ──────────────────────────────────────────────────

function firePointsParticle(
  fromEl: HTMLElement,
  targetEl: HTMLElement,
  label: string,
) {
  const fromRect = fromEl.getBoundingClientRect();
  const targetRect = targetEl.getBoundingClientRect();

  const particle = document.createElement("div");
  particle.className =
    "fixed font-['Barlow_Condensed'] text-2xl font-extrabold text-emerald-500 pointer-events-none z-[9999] whitespace-nowrap animate-fly-up";
  particle.textContent = label;
  particle.style.left = `${fromRect.left + fromRect.width / 2}px`;
  particle.style.top = `${fromRect.top}px`;
  document.body.appendChild(particle);

  const dx =
    targetRect.left +
    targetRect.width / 2 -
    (fromRect.left + fromRect.width / 2);
  const dy = targetRect.top - fromRect.top;

  particle.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.4}px, ${dy * 0.4}px) scale(1.15)`,
        opacity: 1,
        offset: 0.45,
      },
      { transform: `translate(${dx}px, ${dy}px) scale(0.7)`, opacity: 0 },
    ],
    {
      duration: 900,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      fill: "forwards",
    },
  ).onfinish = () => particle.remove();
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  icon,
  children,
  id,
  accent = "#1d9e75",
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  id?: string;
  accent?: string;
}) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 p-5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-xl"
      id={id}
    >
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-60"
        style={{ background: `${accent}60` }}
      />

      {/* Bottom hover line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to right, ${accent}, transparent)`,
        }}
      />

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      <div className="relative mb-2.5 flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-emerald-400/70">
        {icon}
        {label}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

function QuestTimer({ expiresAt }: { expiresAt: string | null }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);
  const { label, urgent } = formatCountdown(expiresAt);
  if (!label) return null;
  return (
    <span
      className={`mt-1 inline-flex items-center gap-1 text-[11px] font-semibold ${
        urgent ? "text-amber-500" : "text-white/25"
      }`}
      key={tick}
    >
      {urgent ? (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M5 3v2.2l1.3 1"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.2" />
          <path
            d="M5 3v2.2l1.3 1"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {label}
    </span>
  );
}

function MatchCard({ match }: { match: Match | null }) {
  const accent = "#1d9e75";

  if (!match) {
    return (
      <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-xl">
        <div className="relative p-4.5 text-center">
          <p className="text-white/40 text-sm">No matches scheduled today</p>
        </div>
      </div>
    );
  }

  const isToday =
    new Date(match.kickoff_time).toDateString() === new Date().toDateString();
  const matchTime = new Date(match.kickoff_time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const matchDate = new Date(match.kickoff_time).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-xl">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-60"
        style={{ background: `${accent}60` }}
      />

      {/* Bottom hover line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to right, ${accent}, transparent)`,
        }}
      />

      <div className="relative flex items-center justify-between border-b border-emerald-500/20 px-4.5 pb-3.5 pt-4">
        <span className="font-['Barlow_Condensed'] text-sm font-bold uppercase tracking-[0.12em] text-emerald-400/70">
          Today's Match
        </span>
        {match.is_live && (
          <div className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.75 text-[10px] font-semibold text-emerald-400 backdrop-blur-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
            LIVE
          </div>
        )}
        {!match.is_live && isToday && (
          <div className="flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.75 text-[10px] font-semibold text-emerald-400 backdrop-blur-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Today
          </div>
        )}
      </div>
      <div className="relative p-4.5">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl leading-none drop-shadow-lg">
              {match.home_flag || getFlagEmoji(match.home_team)}
            </span>
            <span className="font-['Barlow_Condensed'] text-[13px] font-bold uppercase tracking-[0.08em] text-white/80">
              {match.home_team}
            </span>
          </div>
          <span className="font-['Barlow_Condensed'] text-xs font-bold tracking-widest text-emerald-500/50">
            VS
          </span>
          <div className="flex flex-col items-center gap-1">
            <span className="text-3xl leading-none drop-shadow-lg">
              {match.away_flag || getFlagEmoji(match.away_team)}
            </span>
            <span className="font-['Barlow_Condensed'] text-[13px] font-bold uppercase tracking-[0.08em] text-white/80">
              {match.away_team}
            </span>
          </div>
        </div>
        <div className="mb-3 text-center">
          <div className="font-['Barlow_Condensed'] text-[26px] font-extrabold tracking-[0.04em] text-white">
            {matchTime}
          </div>
          <div className="mt-0.5 text-[11px] text-white/40">
            {matchDate} · {match.stadium || "TBD"}
          </div>
        </div>
        <button className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-2.5 font-['DM_Sans'] text-sm font-semibold text-emerald-400 backdrop-blur-sm transition-all hover:bg-emerald-500 hover:text-white">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M6.5 1L8.2 5H12.5L9.2 7.6L10.4 12L6.5 9.3L2.6 12L3.8 7.6L0.5 5H4.8L6.5 1Z"
              fill="currentColor"
            />
          </svg>
          Make a Prediction
        </button>
      </div>
    </div>
  );
}

function LeaderboardCard({
  topEntries,
  userRank,
  userId,
}: {
  topEntries: LeaderboardEntry[];
  userRank: number | null;
  userId?: string;
}) {
  const navigate = useNavigate();
  const accent = "#1d9e75";

  // Get medal icon based on rank
  const getMedalIcon = (rank: number): string => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return "";
    }
  };

  // Get medal color class
  const getMedalColorClass = (rank: number): string => {
    switch (rank) {
      case 1:
        return "text-amber-400";
      case 2:
        return "text-slate-300";
      case 3:
        return "text-amber-700";
      default:
        return "";
    }
  };

  // Use real top 3 from API
  const displayEntries = topEntries.slice(0, 3);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-xl">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-60"
        style={{ background: `${accent}60` }}
      />

      {/* Bottom hover line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to right, ${accent}, transparent)`,
        }}
      />

      <div className="relative flex items-center justify-between border-b border-emerald-500/20 px-4.5 pb-3.5 pt-4">
        <span className="font-['Barlow_Condensed'] text-sm font-bold uppercase tracking-[0.12em] text-emerald-400/70">
          Leaderboard
        </span>
        <span className="text-[11px] tracking-widest text-white/30">
          {userRank ? `#${userRank} You` : "—"}
        </span>
      </div>
      <div className="relative px-4.5 pb-2.5 pt-2.5">
        {displayEntries.map((entry, index) => {
          const rank = entry.rank;
          const medalIcon = getMedalIcon(rank);
          const medalColorClass = getMedalColorClass(rank);

          return (
            <div
              key={index} // Using serial number/index as key
              className="flex items-center gap-2.5 border-b border-emerald-500/10 py-2 last:border-b-0"
            >
              {/* Rank with medal emoji for top 3 */}
              <span
                className={`w-7 shrink-0 text-center font-['Barlow_Condensed'] text-base font-extrabold ${medalColorClass}`}
              >
                {medalIcon}
              </span>

              {/* Avatar placeholder */}
              <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/20 font-['Barlow_Condensed'] text-[13px] font-bold text-emerald-400 backdrop-blur-sm">
                {entry.display_name[0]?.toUpperCase() || "?"}
              </div>

              {/* Name */}
              <span className="flex-1 truncate text-[13px] font-medium text-white/80">
                {entry.display_name}
                {entry.id === userId && (
                  <span className="ml-2 text-[10px] font-bold text-emerald-400">
                    (You)
                  </span>
                )}
              </span>

              {/* Points */}
              <span className="shrink-0 font-['Barlow_Condensed'] text-[15px] font-bold text-white/50">
                {entry.points.toLocaleString()}
              </span>
            </div>
          );
        })}

        {displayEntries.length === 0 && (
          <div className="text-center py-4 text-white/40 text-sm">
            No leaderboard data yet
          </div>
        )}

        <button
          onClick={() => navigate("/leaderboard")}
          className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-[12.5px] font-medium text-white/50 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-white/80"
        >
          View full leaderboard →
        </button>
      </div>
    </div>
  );
}
function ReferralCard({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false);
  const accent = "#1d9e75";

  function handleCopy() {
    const link = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShare() {
    const link = `${window.location.origin}?ref=${referralCode}`;
    if (navigator.share) {
      navigator.share({ title: "Join me on FanCurva", url: link });
    } else {
      handleCopy();
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:shadow-emerald-500/10 hover:shadow-xl">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-60"
        style={{ background: `${accent}60` }}
      />

      {/* Bottom hover line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(to right, ${accent}, transparent)`,
        }}
      />

      <div className="relative flex items-center justify-between border-b border-emerald-500/20 px-4.5 pb-3.5 pt-4">
        <span className="font-['Barlow_Condensed'] text-sm font-bold uppercase tracking-[0.12em] text-emerald-400/70">
          Refer & Earn
        </span>
        <span className="text-[11px] text-emerald-400">+250 pts/referral</span>
      </div>
      <div className="relative p-4.5">
        <div className="mb-2.5 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 backdrop-blur-sm">
          <span className="font-['Barlow_Condensed'] text-lg font-bold tracking-[0.12em] text-white">
            {referralCode}
          </span>
          <button
            onClick={handleCopy}
            className={`rounded-md p-1 transition-colors ${copied ? "text-emerald-400" : "text-white/40 hover:text-emerald-400"}`}
            title="Copy link"
          >
            {copied ? (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path
                  d="M3 7.5l3 3 6-6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect
                  x="5"
                  y="1"
                  width="9"
                  height="9"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M3 5H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
        <p className="mb-3 text-xs text-white/40">
          Share your link. Earn points when friends join.
        </p>
        <button
          onClick={handleShare}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-2.5 font-['DM_Sans'] text-sm font-semibold text-emerald-400 backdrop-blur-sm transition-all hover:bg-emerald-500 hover:text-white"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle
              cx="10"
              cy="2.5"
              r="1.8"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle
              cx="10"
              cy="10.5"
              r="1.8"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <circle
              cx="2.5"
              cy="6.5"
              r="1.8"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <path
              d="M4.2 7.4L8.3 9.6M8.3 3.4L4.2 5.6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
          Share Invite Link
        </button>
      </div>
    </div>
  );
}

function EmptyQuests({
  nextMatchInfo,
}: {
  nextMatchInfo?: { date: string; time: string };
}) {
  const accent = "#1d9e75";

  return (
    <div className="group relative rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 px-8 py-14 text-center shadow-lg backdrop-blur-sm">
      {/* Top accent bar */}
      <div
        className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-60"
        style={{ background: `${accent}60` }}
      />

      <div className="relative">
        <svg
          className="mx-auto mb-5 size-18 opacity-50"
          viewBox="0 0 72 72"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="36" cy="36" r="30" stroke="#1d9e75" strokeWidth="2" />
          <path
            d="M36 18 L44 30 L58 30 L47 39 L51 53 L36 44 L21 53 L25 39 L14 30 L28 30Z"
            stroke="#1d9e75"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle cx="36" cy="36" r="5" fill="#1d9e75" opacity="0.15" />
        </svg>
        <p className="font-['Barlow_Condensed'] text-xl font-bold uppercase tracking-[0.06em] text-white/50">
          No Active Quests Right Now
        </p>
        <p className="text-[13px] text-white/30">
          Quests go live 1 hour before kickoff.
        </p>
        {nextMatchInfo && (
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-400 backdrop-blur-sm">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <circle
                cx="6"
                cy="6"
                r="4.5"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path
                d="M6 3.5v2.7l1.5 1"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            Next match: {nextMatchInfo.date} · {nextMatchInfo.time}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { user } = useUserStore();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [points, setPoints] = useState<Points | null>(null);
  const [topLeaderboard, setTopLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [nextMatch] = useState<Match | null>(null);
  const [badgesCount, setBadgesCount] = useState<number>(0);
  const [completing, setCompleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Refs for the points animation
  const pointsStatRef = useRef<HTMLDivElement>(null);
  const questBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const showToast = useCallback((msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch active quests
        const questsRes = await questsApi.list({ status: "active" });
        setQuests(questsRes.data.data || []);

        // Fetch points and rank
        const pointsRes = await pointsApi.get(user.id);
        setPoints(pointsRes.data.data);

        // Fetch leaderboard top 10
        const leaderboardRes = await leaderboardApi.get({
          scope: "overall",
          limit: 10,
        });
        const entries = leaderboardRes.data.data?.entries || [];
        setTopLeaderboard(entries);

        // Fetch badges count
        const badgesRes = await badgesApi.myBadges(user.id);
        setBadgesCount(badgesRes.data.data?.length || 0);

        // Fetch next match (you'll need to implement this API endpoint)
        // For now, we'll use a placeholder or skip
        // const matchRes = await matchesApi.getNext();
        // setNextMatch(matchRes.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  async function completeQuest(quest: Quest) {
    setCompleting(quest.id);
    try {
      const res = await questsApi.complete(quest.id);
      const { points_awarded, new_status_tier } = res.data.data;

      // Fire the particle from the quest button toward the points stat card
      const btnEl = questBtnRefs.current[quest.id];
      const targetEl = pointsStatRef.current;
      if (btnEl && targetEl) {
        firePointsParticle(btnEl, targetEl, `+${points_awarded}`);
      }

      showToast(
        `+${points_awarded} pts earned! Tier: ${new_status_tier}`,
        "success",
      );

      // Refresh points and quests
      if (user) {
        const pointsRes = await pointsApi.get(user.id);
        setPoints(pointsRes.data.data);
      }
      const questsRes = await questsApi.list({ status: "active" });
      setQuests(questsRes.data.data || []);

      // Refresh leaderboard to update user's rank
      const leaderboardRes = await leaderboardApi.get({
        scope: "overall",
        limit: 10,
      });
      setTopLeaderboard(leaderboardRes.data.data?.entries || []);
    } catch (err: any) {
      showToast(
        err.response?.data?.error?.message || "Error completing quest",
        "error",
      );
    } finally {
      setCompleting(null);
    }
  }

  const tier =
    TIER_CONFIG[user?.status_tier ?? "supporter"] ?? TIER_CONFIG.supporter;
  const totalPoints = points?.total_points ?? user?.points ?? 0;
  const sortedQuests = sortByExpiry(quests);
  const accent = tier.accent;

  // Find user's rank from leaderboard data
  const userRank =
    topLeaderboard.find((entry) => entry.id === user?.id)?.rank ||
    points?.rank_overall ||
    null;

  if (loading && !quests.length && !points) {
    return (
      <div className="relative min-h-screen bg-linear-to-b from-[#0a120e] via-[#080c0a] to-[#050807] font-['DM_Sans'] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-white/50">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#0a120e] via-[#080c0a] to-[#050807] font-['DM_Sans'] text-white">
      {/* Ambient gradient backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_15%_0%,rgba(29,158,117,0.15)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_85%_100%,rgba(29,158,117,0.1)_0%,transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Toast notifications */}
      {toast && (
        <div
          className={`fixed right-6 top-18 z-50 flex min-w-55 items-center gap-2.5 rounded-xl border-l-3 px-4 py-3.5 text-sm font-semibold text-white shadow-xl backdrop-blur-sm animate-toast-in ${
            toast.type === "success"
              ? "border-emerald-500 bg-emerald-950/80"
              : "border-red-500 bg-red-950/80"
          }`}
        >
          <span className="text-base">
            {toast.type === "success" ? "⚡" : "⚠️"}
          </span>
          {toast.msg}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 pt-2">
        <div className="mx-auto max-w-275 px-5 py-6 pb-20 md:px-12">
          {/* Page header */}
          <div className="mb-8">
            <p className="mb-2 font-['DM_Sans'] text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              World Cup 2026
            </p>
            <h1 className="font-['Barlow_Condensed'] text-[clamp(44px,5.5vw,68px)] font-extrabold uppercase tracking-[-0.01em] text-white">
              Welcome,{" "}
              <span className="bg-linear-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                {user?.display_name ?? "Fan"}
              </span>
            </h1>
          </div>

          {/* Stats row */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total Points"
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <polygon
                    points="6,1 7.5,4.5 11.5,4.8 8.8,7.2 9.7,11.1 6,9 2.3,11.1 3.2,7.2 0.5,4.8 4.5,4.5"
                    fill="currentColor"
                  />
                </svg>
              }
              id="db-stat-points"
              accent={accent}
            >
              <div ref={pointsStatRef} />
              <div className="font-['Barlow_Condensed'] text-[42px] font-extrabold leading-none tracking-[-0.5px] bg-linear-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                {totalPoints.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-white/30">
                All-time earned
              </div>
            </StatCard>

            <StatCard
              label="Global Rank"
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 10V7M6 10V4M10 10V1"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              }
              accent={accent}
            >
              <div className="font-['Barlow_Condensed'] text-[42px] font-extrabold leading-none tracking-[-0.5px] text-white">
                {userRank ? `#${userRank}` : "—"}
              </div>
              <div className="mt-1 text-[11px] text-white/30">
                {points?.rank_team
                  ? `#${points.rank_team} in team`
                  : "Team rank pending"}
              </div>
            </StatCard>

            <StatCard
              label="Badges"
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1l1 3h3l-2.5 2 1 3L6 8l-2.5 1 1-3L2 4h3z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              accent={accent}
            >
              <div className="font-['Barlow_Condensed'] text-[42px] font-extrabold leading-none tracking-[-0.5px] text-white">
                {badgesCount}
              </div>
              <div className="mt-1 text-[11px] text-white/30">Collected</div>
            </StatCard>

            <StatCard
              label="Status Tier"
              icon={
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M1 9l3-5 3 3 2-4 2 6"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }
              accent={accent}
            >
              <div
                className="mt-1.5 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[13px] font-bold uppercase tracking-[0.08em] backdrop-blur-sm"
                style={{
                  color: tier.color,
                  background: tier.bg,
                  borderColor: tier.border,
                }}
              >
                {tier.label}
              </div>
              <div className="mt-2 text-[11px] text-white/30">
                {totalPoints.toLocaleString()} pts total
              </div>
            </StatCard>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left: quest feed */}
            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.25em] text-emerald-400">
                    Today
                  </p>
                  <h2 className="font-['Barlow_Condensed'] text-[28px] font-extrabold uppercase tracking-[0.03em] text-white">
                    Active Quests
                  </h2>
                </div>
                <span className="pb-0.5 text-[11px] uppercase tracking-[0.18em] text-white/30">
                  {sortedQuests.length} available
                </span>
              </div>

              {sortedQuests.length === 0 ? (
                <EmptyQuests
                  nextMatchInfo={
                    nextMatch
                      ? {
                          date: new Date(
                            nextMatch.kickoff_time,
                          ).toLocaleDateString([], {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }),
                          time: new Date(
                            nextMatch.kickoff_time,
                          ).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {sortedQuests.map((quest) => {
                    const { urgent } = formatCountdown(quest.expires_at);
                    const isExpiringSoon = urgent && !!quest.expires_at;
                    const questAccent = isExpiringSoon ? "#f59e0b" : accent;

                    return (
                      <div
                        key={quest.id}
                        className={`group relative flex items-center gap-4 rounded-xl border bg-linear-to-br from-emerald-950/30 via-emerald-900/15 to-emerald-950/30 p-4.5 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-emerald-500/10 hover:shadow-xl ${
                          isExpiringSoon
                            ? "border-amber-500/30 hover:border-amber-500/50"
                            : "border-emerald-500/20 hover:border-emerald-500/40"
                        }`}
                      >
                        {/* Top accent bar */}
                        <div
                          className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-60"
                          style={{ background: `${questAccent}60` }}
                        />

                        {/* Bottom hover line */}
                        <div
                          className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          style={{
                            background: `linear-gradient(to right, ${questAccent}, transparent)`,
                          }}
                        />

                        {/* Left accent bar */}
                        <div
                          className={`absolute left-0 top-3.5 bottom-3.5 w-0.5 rounded-full transition-all duration-300 group-hover:w-1 ${
                            isExpiringSoon ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                        />

                        <div className="relative flex h-11.5 w-11.5 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-xl backdrop-blur-sm transition-all group-hover:scale-105">
                          {QUEST_ICONS[quest.type] ?? QUEST_ICONS.default}
                        </div>
                        <div className="relative min-w-0 flex-1">
                          <p className="font-['Barlow_Condensed'] text-[17px] font-bold uppercase tracking-[0.04em] text-white">
                            {quest.title}
                          </p>
                          <p className="truncate text-[12.5px] text-white/40">
                            {quest.description}
                          </p>
                          <QuestTimer expiresAt={quest.expires_at} />
                        </div>
                        <div className="relative flex shrink-0 items-center gap-3.5">
                          <div className="text-center">
                            <div className="font-['Barlow_Condensed'] text-[22px] font-extrabold leading-none bg-linear-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                              +{quest.points_reward}
                            </div>
                            <div className="text-[9.5px] uppercase tracking-[0.18em] text-white/30">
                              pts
                            </div>
                          </div>
                          <button
                            ref={(el) => {
                              questBtnRefs.current[quest.id] = el;
                            }}
                            disabled={completing === quest.id}
                            onClick={() => completeQuest(quest)}
                            className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 font-['DM_Sans'] text-sm font-semibold text-emerald-400 backdrop-blur-sm transition-all hover:bg-emerald-500 hover:text-white active:scale-95 disabled:opacity-40"
                          >
                            {completing === quest.id ? (
                              <>
                                <span className="inline-block h-3 w-3 animate-spin-slow rounded-full border-2 border-current border-t-transparent" />
                                Completing
                              </>
                            ) : (
                              "Complete"
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: sidebar */}
            <div className="flex flex-col gap-4">
              <MatchCard match={nextMatch} />
              <LeaderboardCard
                topEntries={topLeaderboard}
                userRank={userRank}
                userId={user?.id}
              />
              {user?.referral_code && (
                <ReferralCard referralCode={user.referral_code} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
