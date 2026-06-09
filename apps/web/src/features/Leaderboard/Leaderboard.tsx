/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { leaderboardApi } from "../../lib/api";
import { useUserStore } from "../../store/userStore";
import { TEAMS, TEAMS_BY_CODE } from "../../constants/teams";
import TeamFlag from "../../components/TeamFlag";

/* ─── Config ────────────────────────────────────────────── */
const TIER_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; label: string; accent: string }
> = {
  supporter: {
    color: "#888780",
    bg: "#1a1a1a",
    border: "#333",
    label: "Supporter",
    accent: "#888780",
  },
  true_fan: {
    color: "#4A9EFF",
    bg: "#1A2E4A",
    border: "#4A9EFF",
    label: "True Fan",
    accent: "#4A9EFF",
  },
  ultras: {
    color: "#C084FC",
    bg: "#2A1A3A",
    border: "#C084FC",
    label: "Ultras",
    accent: "#C084FC",
  },
  legend: {
    color: "#FFD700",
    bg: "#2A2200",
    border: "#FFD700",
    label: "Legend",
    accent: "#FFD700",
  },
};

const RANK_MEDAL: Record<
  number,
  { emoji: string; color: string; glow: string }
> = {
  0: { emoji: "🥇", color: "#FFD700", glow: "rgba(255,215,0,0.12)" },
  1: { emoji: "🥈", color: "#C0C0C0", glow: "rgba(192,192,192,0.08)" },
  2: { emoji: "🥉", color: "#CD7F32", glow: "rgba(205,127,50,0.08)" },
};

const SCOPES = [
  { key: "overall", label: "Overall" },
  { key: "team", label: "Team" },
  { key: "host_country", label: "Host Country" },
  { key: "top_inviters", label: "Top Inviters" },
] as const;
type Scope = (typeof SCOPES)[number]["key"];

const TEAM_OPTIONS = TEAMS.map((t) => ({ key: t.code, label: t.name }));

/* ─── Skeleton row ──────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 px-6 py-4 flex items-center gap-4 shadow-lg backdrop-blur-sm animate-pulse">
      <div className="w-8 h-5 rounded bg-white/6 shrink-0" />
      <div className="w-10 h-10 rounded-xl bg-white/6 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 rounded bg-white/6" />
        <div className="h-3 w-16 rounded bg-white/5" />
      </div>
      <div className="text-right space-y-2">
        <div className="h-5 w-14 rounded bg-white/6 ml-auto" />
        <div className="h-4 w-20 rounded bg-white/5 ml-auto" />
      </div>
    </div>
  );
}

/* ─── Team picker dropdown ──────────────────────────────── */
function TeamPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = TEAM_OPTIONS.find((t) => t.key === value) ?? TEAM_OPTIONS[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative mb-6">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 hover:border-emerald-500/50 transition-all duration-200 text-sm font-semibold text-white/70 hover:text-white shadow-lg backdrop-blur-sm"
      >
        <TeamFlag
          code={selected.key}
          className="w-4 h-auto rounded-sm inline-block"
        />
        <span className="font-['Barlow_Condensed',sans-serif] tracking-wide uppercase text-base">
          {selected.label}
        </span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`ml-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 w-52 rounded-xl border border-white/10 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 shadow-2xl backdrop-blur-sm overflow-hidden">
          {TEAM_OPTIONS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                onChange(t.key);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 ${
                t.key === value
                  ? "bg-emerald-500/15 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <TeamFlag
                code={t.key}
                className="w-4 h-auto rounded-sm inline-block"
              />
              <span className="font-['Barlow_Condensed',sans-serif] tracking-wide uppercase text-sm font-bold">
                {t.label}
              </span>
              {t.key === value && (
                <svg
                  className="ml-auto shrink-0"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="#1D9E75"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Entries list ──────────────────────────────────────── */
function EntriesList({
  scope,
  teamFilter,
  userId,
}: {
  scope: Scope;
  teamFilter: string;
  userId?: string;
}) {
  const [entries, setEntries] = useState<any[] | null>(null);

  useEffect(() => {
    const params: Record<string, any> = { scope, limit: 50 };
    if (scope === "team" && teamFilter) params.team = teamFilter;
    leaderboardApi
      .get(params)
      .then((r) => setEntries(r.data.data.entries))
      .catch(() => setEntries([]));
  }, [scope, teamFilter]);

  const loading = entries === null;
  const safeList = entries ?? [];
  const userIdx = safeList.findIndex((e) => e.id === userId);
  const userEntry = userIdx >= 0 ? safeList[userIdx] : null;
  const userRank = userIdx >= 0 ? userIdx + 1 : null;
  const nextEntry = userRank && userRank > 1 ? safeList[userIdx - 1] : null;
  const ptsToNext =
    nextEntry && userEntry ? nextEntry.points - userEntry.points : null;

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {safeList.map((entry, i) => {
          const isUser = entry.id === userId;
          const medal = RANK_MEDAL[i];
          const tier = TIER_CONFIG[entry.status_tier] ?? TIER_CONFIG.supporter;
          const teamMeta = entry.team_code
            ? (TEAMS_BY_CODE[entry.team_code] ?? null)
            : null;

          return (
            <div
              key={entry.id}
              className="group relative overflow-hidden rounded-2xl border px-6 py-4 flex items-center gap-4 transition-all duration-300"
              style={{
                background: isUser
                  ? "linear-gradient(135deg, rgba(29,158,117,0.15), rgba(29,158,117,0.05))"
                  : medal
                    ? `linear-gradient(135deg, ${medal.glow}, transparent)`
                    : "linear-gradient(135deg, rgba(29,158,117,0.08), rgba(29,158,117,0.02))",
                borderColor: isUser
                  ? "rgba(29,158,117,0.5)"
                  : medal
                    ? `${medal.color}33`
                    : "rgba(255,255,255,0.06)",
                backdropFilter: "blur(4px)",
              }}
            >
              {/* Top accent bar */}
              <div
                className="absolute top-0 left-6 right-6 h-0.5 rounded-full"
                style={{
                  background: isUser
                    ? `${tier.accent}60`
                    : medal
                      ? `${medal.color}40`
                      : "transparent",
                }}
              />

              {/* Bottom hover line */}
              <div
                className="absolute bottom-0 left-6 right-6 h-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(to right, ${isUser ? tier.accent : medal ? medal.color : tier.accent}, transparent)`,
                }}
              />

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {/* left accent bar — user only */}
              {isUser && (
                <div className="absolute left-0 top-3 bottom-3 w-0.75 rounded-full bg-emerald-500" />
              )}

              {/* top-3 left accent bar */}
              {!isUser && medal && (
                <div
                  className="absolute left-0 top-3 bottom-3 w-0.75 rounded-full"
                  style={{ background: medal.color, opacity: 0.5 }}
                />
              )}

              {/* rank */}
              <div className="w-9 text-center shrink-0">
                {medal ? (
                  <span className="text-2xl leading-none">{medal.emoji}</span>
                ) : (
                  <span
                    className="font-['Barlow_Condensed',sans-serif] font-extrabold text-lg leading-none"
                    style={{ color: isUser ? "#1D9E75" : "#444441" }}
                  >
                    #{i + 1}
                  </span>
                )}
              </div>

              {/* avatar */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 font-['Barlow_Condensed',sans-serif] text-base transition-all group-hover:scale-105"
                style={{
                  backgroundColor: isUser
                    ? "rgba(29,158,117,0.18)"
                    : medal
                      ? `${medal.color}18`
                      : "rgba(255,255,255,0.04)",
                  color: isUser ? "#1D9E75" : medal ? medal.color : "#888780",
                  border: `1px solid ${
                    isUser
                      ? "rgba(29,158,117,0.28)"
                      : medal
                        ? `${medal.color}30`
                        : "rgba(255,255,255,0.07)"
                  }`,
                }}
              >
                {entry.display_name?.[0]?.toUpperCase() ?? "?"}
              </div>

              {/* name + team */}
              <div className="flex-1 min-w-0">
                <p className="font-['Barlow_Condensed',sans-serif] font-bold text-lg text-white uppercase tracking-wide leading-none truncate">
                  {entry.display_name}
                  {isUser && (
                    <span className="ml-2 text-[10px] font-bold tracking-[0.2em] normal-case text-emerald-400 align-middle border border-emerald-500/40 px-1.5 py-0.5 rounded">
                      YOU
                    </span>
                  )}
                </p>
                <p className="text-white/25 text-xs mt-1 flex items-center gap-1.5 truncate">
                  {teamMeta ? (
                    <>
                      <TeamFlag
                        code={teamMeta.code}
                        className="w-4 h-auto rounded-sm inline-block"
                      />
                      <span>{teamMeta.name}</span>
                    </>
                  ) : (
                    <span>Tournament</span>
                  )}
                </p>
              </div>

              {/* tier + points */}
              <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                <p
                  className="font-['Barlow_Condensed',sans-serif] font-bold text-xl leading-none"
                  style={{
                    color: isUser ? "#1D9E75" : medal ? medal.color : "#1D9E75",
                  }}
                >
                  {entry.points.toLocaleString()}
                  <span className="text-xs font-semibold opacity-60 ml-1">
                    pts
                  </span>
                </p>
                <span
                  className="inline-flex items-center text-[10px] font-bold tracking-[0.18em] uppercase px-2 py-0.5 rounded border backdrop-blur-sm"
                  style={{
                    color: tier.color,
                    backgroundColor: tier.bg,
                    borderColor: tier.border,
                  }}
                >
                  {tier.label}
                </span>
              </div>
            </div>
          );
        })}

        {safeList.length === 0 && (
          <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 px-8 py-16 text-center shadow-lg backdrop-blur-sm">
            <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-emerald-500/60" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <p className="text-4xl mb-4">🏆</p>
            <p className="font-['Barlow_Condensed',sans-serif] font-bold text-xl text-white/40 uppercase tracking-wide">
              No Rankings Yet
            </p>
            <p className="text-white/25 text-sm mt-2">
              Complete quests to appear on the leaderboard.
            </p>
          </div>
        )}
      </div>

      {/* ── sticky my-rank callout ── */}
      {userRank && userEntry && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/8 bg-[#080c0a]/96 backdrop-blur-md px-6 py-3.5">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/12 border border-emerald-500/25 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="#1D9E75"
                    strokeWidth="1.5"
                  />
                  <path d="M5 8 Q8 4 11 8 Q8 12 5 8Z" fill="#1D9E75" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] leading-none mb-0.5">
                  Your rank
                </p>
                <p className="font-['Barlow_Condensed',sans-serif] font-extrabold text-xl text-white leading-none">
                  #{userRank}
                </p>
              </div>
            </div>

            <div className="h-8 w-px bg-white/8 hidden sm:block" />

            <div className="flex-1 text-center hidden sm:block">
              {ptsToNext !== null && ptsToNext > 0 ? (
                <p className="text-white/35 text-sm">
                  <span className="text-emerald-400 font-bold">
                    {ptsToNext.toLocaleString()} pts
                  </span>{" "}
                  to reach{" "}
                  <span className="text-white/60 font-semibold">
                    #{userRank - 1}
                  </span>
                </p>
              ) : (
                <p className="text-amber-400 text-sm font-semibold">
                  🥇 You're at the top!
                </p>
              )}
            </div>

            <div className="h-8 w-px bg-white/8 hidden sm:block" />

            <div className="text-right shrink-0">
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] leading-none mb-0.5">
                Points
              </p>
              <p className="font-['Barlow_Condensed',sans-serif] font-extrabold text-xl text-emerald-400 leading-none">
                {userEntry.points.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Page shell ────────────────────────────────────────── */
export default function Leaderboard() {
  const { user } = useUserStore();
  const [scope, setScope] = useState<Scope>("overall");
  const [teamFilter, setTeamFilter] = useState<string>(TEAM_OPTIONS[0].key);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#0a120e] via-[#080c0a] to-[#050807] font-['DM_Sans',sans-serif] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_15%_0%,rgba(29,158,117,0.15)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_85%_100%,rgba(29,158,117,0.1)_0%,transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 pt-10 pb-28 max-w-3xl mx-auto px-6 md:px-12">
        {/* ── Page header ── */}
        <div className="mt-8 mb-8">
          <p className="text-emerald-400 text-xs tracking-[0.25em] uppercase font-semibold mb-2">
            Rankings
          </p>
          <h1 className="font-['Barlow_Condensed',sans-serif] font-extrabold text-[52px] md:text-[68px] text-white uppercase tracking-tight leading-none">
            Leaderboard
          </h1>
        </div>

        {/* ── Scope tabs ── */}
        <div className="flex items-center gap-1 mb-8 border-b border-white/6">
          {SCOPES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setScope(key)}
              className={`relative pb-3 px-3 text-sm font-semibold uppercase tracking-widest whitespace-nowrap transition-colors duration-200 ${
                scope === key
                  ? "text-white"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {label}
              {scope === key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-emerald-500" />
              )}
            </button>
          ))}
        </div>

        {/* ── Team picker (team tab only) ── */}
        {scope === "team" && (
          <TeamPicker value={teamFilter} onChange={setTeamFilter} />
        )}

        {/* key forces clean remount on scope/teamFilter change */}
        <EntriesList
          key={`${scope}-${teamFilter}`}
          scope={scope}
          teamFilter={teamFilter}
          userId={user?.id}
        />
      </div>
    </div>
  );
}
