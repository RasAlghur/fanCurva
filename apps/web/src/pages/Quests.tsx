import { useEffect, useMemo, useState } from "react";
import { questsApi } from "../lib/api";

interface Quest {
  id: string;
  title: string;
  description: string;
  type: string;
  points_reward: number;
  expires_at: string;
  completed?: boolean;
  match_details?: {
    home_team: string;
    away_team: string;
    home_flag?: string;
    away_flag?: string;
    kickoff_time: string;
    stadium: string;
  };
  badge_reward?: {
    id: string;
    name: string;
    image?: string;
  };
}

const QUEST_TYPE_ICON: Record<string, string> = {
  match_checkin: "⚽",
  trivia: "🧠",
  prediction: "🎯",
  watch_party: "🏠",
  referral: "🤝",
  default: "⚡",
};

const QUEST_TYPE_LABEL: Record<string, string> = {
  match_checkin: "Match Day",
  trivia: "Trivia",
  prediction: "Prediction",
  watch_party: "Watch Party",
  referral: "Referral",
  default: "Quest",
};

function formatCountdown(
  expiresAt: string,
  now: number,
): {
  label: string;
  urgent: boolean;
} {
  const diff = new Date(expiresAt).getTime() - now;
  if (diff <= 0) return { label: "Expired", urgent: true };
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (h < 1) return { label: `${m}m left`, urgent: true };
  if (h < 3) return { label: `${h}h ${m}m left`, urgent: true };
  return { label: `${h}h left`, urgent: false };
}

function QuestCard({ quest, now }: { quest: Quest; now: number }) {
  const isExpired = new Date(quest.expires_at).getTime() < now;
  const countdown = !isExpired ? formatCountdown(quest.expires_at, now) : null;
  const icon = QUEST_TYPE_ICON[quest.type] ?? QUEST_TYPE_ICON.default;
  const typeLabel = QUEST_TYPE_LABEL[quest.type] ?? QUEST_TYPE_LABEL.default;

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-emerald-500/10 hover:shadow-xl ${
        quest.completed
          ? "border-emerald-500/40 opacity-75"
          : isExpired
            ? "border-red-500/30 opacity-60"
            : "border-white/5 hover:border-emerald-500/30"
      }`}
    >
      {/* Top accent bar */}
      <div
        className={`absolute top-0 left-6 right-6 h-0.5 rounded-full ${
          quest.completed
            ? "bg-emerald-500/60"
            : isExpired
              ? "bg-red-500/60"
              : "bg-emerald-500/60"
        }`}
      />

      {/* Bottom hover line */}
      <div className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 bg-linear-to-r from-emerald-500 to-transparent group-hover:opacity-100" />

      {/* Shimmer effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

      {/* Content */}
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-xl">
              {icon}
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/70">
                {typeLabel}
              </span>
              <h3 className="font-['Barlow_Condensed'] text-xl font-extrabold uppercase tracking-[0.03em] text-white">
                {quest.title}
              </h3>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-['Barlow_Condensed'] text-2xl font-extrabold text-emerald-400">
              +{quest.points_reward.toLocaleString()}
            </div>
            <div className="text-[9px] uppercase tracking-[0.18em] text-white/30">
              points
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="mb-3 text-sm text-white/50 leading-relaxed">
          {quest.description}
        </p>

        {/* Match details (if match quest) */}
        {quest.match_details && (
          <div className="mb-3 rounded-lg border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {quest.match_details.home_flag || "🏆"}
                </span>
                <span className="font-['Barlow_Condensed'] text-base font-bold text-white">
                  {quest.match_details.home_team}
                </span>
              </div>
              <span className="text-xs font-bold text-white/40">VS</span>
              <div className="flex items-center gap-3">
                <span className="font-['Barlow_Condensed'] text-base font-bold text-white">
                  {quest.match_details.away_team}
                </span>
                <span className="text-2xl">
                  {quest.match_details.away_flag || "🏆"}
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-white/40">
                {new Date(quest.match_details.kickoff_time).toLocaleString()} ·{" "}
                {quest.match_details.stadium}
              </p>
            </div>
          </div>
        )}

        {/* Badge preview */}
        {quest.badge_reward && !quest.completed && !isExpired && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
            <span className="text-lg">🏅</span>
            <span className="text-xs font-medium text-emerald-400">
              Earns "{quest.badge_reward.name}" badge
            </span>
          </div>
        )}

        {/* Footer: expiry + status */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          {quest.completed ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 text-sm">✓</span>
              <span className="text-xs font-semibold text-emerald-400">
                Quest Complete
              </span>
              {quest.badge_reward && (
                <span className="text-xs text-white/40">· Badge earned 🏅</span>
              )}
            </div>
          ) : isExpired ? (
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-sm">⚠️</span>
              <span className="text-xs font-semibold text-red-400">
                Expired
              </span>
            </div>
          ) : (
            countdown && (
              <div className="flex items-center gap-2">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle
                    cx="5"
                    cy="5"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M5 3v2.2l1.3 1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className={`text-xs font-semibold ${countdown.urgent ? "text-amber-500" : "text-white/40"}`}
                >
                  {countdown.label}
                </span>
              </div>
            )
          )}

          {!quest.completed && !isExpired && (
            <button className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-white">
              Complete Quest →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Quests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    questsApi
      .list()
      .then((r) => {
        setQuests(r.data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Replace the entire useMemo block with these two:
  const [now] = useState<number>(() => Date.now());

  const { activeQuests, completedQuests, expiredQuests } = useMemo(
    () => ({
      activeQuests: quests.filter(
        (q) => !q.completed && new Date(q.expires_at).getTime() > now,
      ),
      completedQuests: quests.filter((q) => q.completed),
      expiredQuests: quests.filter(
        (q) => !q.completed && new Date(q.expires_at).getTime() <= now,
      ),
    }),
    [quests, now],
  );

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#0a120e] via-[#080c0a] to-[#050807] font-['DM_Sans'] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_15%_0%,rgba(29,158,117,0.15)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_85%_100%,rgba(29,158,117,0.1)_0%,transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 pt-20">
        <div className="mx-auto max-w-3xl px-5 pb-20 md:px-12">
          {/* Page header */}
          <div className="mb-8">
            <p className="mb-2 font-['DM_Sans'] text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Challenges
            </p>
            <h1 className="font-['Barlow_Condensed'] text-[clamp(44px,5.5vw,68px)] font-extrabold uppercase tracking-[-0.01em] text-white">
              All{" "}
              <span className="bg-linear-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                Quests
              </span>
            </h1>
            <p className="mt-2 text-white/40">
              {quests.length} total · {activeQuests.length} active
            </p>
          </div>

          {loading ? (
            // Skeleton loaders
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 p-6 animate-pulse"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/10" />
                      <div>
                        <div className="h-3 w-16 rounded bg-white/10 mb-2" />
                        <div className="h-5 w-40 rounded bg-white/10" />
                      </div>
                    </div>
                    <div className="h-8 w-16 rounded bg-white/10" />
                  </div>
                  <div className="h-4 w-full rounded bg-white/10 mb-3" />
                  <div className="h-4 w-3/4 rounded bg-white/10" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Active Quests Section */}
              {activeQuests.length > 0 && (
                <>
                  <h2 className="font-['Barlow_Condensed'] text-xl font-extrabold uppercase tracking-[0.06em] text-white/60 mt-2 mb-1">
                    Active Quests
                  </h2>
                  {activeQuests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} now={now} />
                  ))}
                </>
              )}

              {/* Completed Quests Section */}
              {completedQuests.length > 0 && (
                <>
                  <h2 className="font-['Barlow_Condensed'] text-xl font-extrabold uppercase tracking-[0.06em] text-white/60 mt-6 mb-1">
                    Completed
                  </h2>
                  {completedQuests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} now={now} />
                  ))}
                </>
              )}

              {/* Expired Quests Section */}
              {expiredQuests.length > 0 && (
                <>
                  <h2 className="font-['Barlow_Condensed'] text-xl font-extrabold uppercase tracking-[0.06em] text-white/60 mt-6 mb-1">
                    Expired
                  </h2>
                  {expiredQuests.map((quest) => (
                    <QuestCard key={quest.id} quest={quest} now={now} />
                  ))}
                </>
              )}

              {/* Empty state */}
              {quests.length === 0 && (
                <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 p-12 text-center shadow-lg backdrop-blur-sm">
                  <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-emerald-500/60" />
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <p className="text-5xl mb-4">🎯</p>
                  <p className="font-['Barlow_Condensed'] text-xl font-extrabold uppercase tracking-[0.06em] text-white/40">
                    No Quests Available
                  </p>
                  <p className="mt-2 text-sm text-white/30">
                    Check back during match days for live quests!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
