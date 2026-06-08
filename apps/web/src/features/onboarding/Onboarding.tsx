/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { usersApi, passportsApi, setAuthToken } from "../../lib/api";
import { useUserStore } from "../../store/userStore";

import TeamFlag from "../../components/TeamFlag";
import {
  CONTINENT_ORDER,
  TEAMS,
  TEAMS_BY_CONTINENT,
} from "../../constants/teams";

// ── Types ────────────────────────────────────────────────────────────────────

type Step = "profile" | "team" | "minting" | "success";

interface Team {
  code: string;
  name: string;
  accent: string;
  secondary: string;
  continent: string;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface ProgressProps {
  step: Step;
}

function Progress({ step }: ProgressProps) {
  const steps = [
    { key: "profile", label: "Name" },
    { key: "team", label: "Team" },
  ];
  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, idx) => (
        <div key={s.key} className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                idx <= currentIndex
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-emerald-800 bg-emerald-950/50 text-white/40"
              }`}
            >
              {idx < currentIndex ? "✓" : idx + 1}
            </div>
            <span
              className={`text-xs uppercase tracking-wide ${
                idx <= currentIndex ? "text-emerald-400" : "text-white/30"
              }`}
            >
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div
              className={`flex-1 h-px rounded-full ${
                idx < currentIndex ? "bg-emerald-500" : "bg-white/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Steps ────────────────────────────────────────────────────────────────────

interface ProfileStepProps {
  displayName: string;
  error: string;
  onChange: (val: string) => void;
  onContinue: () => void;
}

function ProfileStep({
  displayName,
  error,
  onChange,
  onContinue,
}: ProfileStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div>
      <Progress step="profile" />
      <h1 className="font-['Barlow_Condensed'] text-4xl font-extrabold text-white leading-tight mb-1.5">
        Choose your name
      </h1>
      <p className="text-sm text-white/40 mb-7">
        This is how other fans will know you.
      </p>
      <div className="relative mb-3">
        <input
          ref={inputRef}
          className="w-full px-4 py-3.5 bg-emerald-950/30 border border-white/10 rounded-xl text-white font-['DM_Sans'] text-base outline-none focus:border-emerald-500/50 transition-all"
          type="text"
          placeholder="e.g. SambaFan99"
          maxLength={32}
          value={displayName}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onContinue();
          }}
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm mb-3 flex items-center gap-1.5">
          ⚠ {error}
        </p>
      )}
      <button
        className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-['DM_Sans'] font-semibold flex items-center justify-center gap-2 transition-all hover:bg-emerald-600 active:scale-98"
        onClick={onContinue}
      >
        Continue
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 3l5 5-5 5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

interface TeamStepProps {
  selectedTeam: string;
  error: string;
  onSelect: (code: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

function TeamStep({
  selectedTeam,
  error,
  onSelect,
  onConfirm,
  onBack,
}: TeamStepProps) {
  return (
    <div>
      <Progress step="team" />
      <button
        className="inline-flex items-center gap-1.5 bg-none border-none text-white/40 font-['DM_Sans'] text-sm cursor-pointer mb-5 transition-colors hover:text-emerald-400"
        onClick={onBack}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M9 2L4 7l5 5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Back
      </button>
      <h1 className="font-['Barlow_Condensed'] text-4xl font-extrabold text-white leading-tight mb-1.5">
        Pick your team
      </h1>
      <p className="text-sm text-white/40 mb-6">
        Your allegiance, sealed forever on the blockchain.
      </p>

      {/* Teams Grid with Scroll */}
      <div className="max-h-96 overflow-y-auto pr-1 mb-4 space-y-6 custom-scrollbar">
        {CONTINENT_ORDER.map((continent) => {
          const continentTeams = TEAMS_BY_CONTINENT[continent];
          if (!continentTeams || continentTeams.length === 0) return null;

          // Special label for display
          const displayName =
            continent === "Co-hosts"
              ? "Co-hosts (Canada, Mexico, USA)"
              : continent;

          return (
            <div key={continent}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mb-2">
                {displayName} · {continentTeams.length} team
                {continentTeams.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {continentTeams.map((team) => {
                  const isSelected = selectedTeam === team.code;

                  // Create gradient from team colors
                  const gradientStyle = {
                    background: `linear-gradient(135deg, ${team.accent}15, ${team.secondary}10, ${team.accent}08)`,
                    borderColor: isSelected ? team.accent : `${team.accent}40`,
                  };

                  return (
                    <button
                      key={team.code}
                      className={`group relative rounded-xl p-3 text-center transition-all duration-300 overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-emerald-500 bg-emerald-500/15"
                          : "hover:scale-105"
                      }`}
                      style={gradientStyle}
                      onClick={() => onSelect(team.code)}
                    >
                      {/* Top accent bar - always visible with team color */}
                      <div
                        className="absolute top-0 left-3 right-3 h-0.5 rounded-full transition-all duration-300"
                        style={{
                          background: team.accent,
                          opacity: isSelected ? 1 : 0.4,
                          boxShadow: isSelected
                            ? `0 0 8px ${team.accent}`
                            : "none",
                        }}
                      />

                      {/* Shimmer effect on hover */}
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                      {/* Glow effect on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-xl"
                        style={{
                          background: `radial-gradient(circle at center, ${team.accent}40, transparent 70%)`,
                          filter: "blur(8px)",
                        }}
                      />

                      <TeamFlag
                        code={team.code}
                        className="w-8 h-auto rounded-sm"
                      />
                      <div className="font-['Barlow_Condensed'] text-xs font-bold text-white/80 uppercase tracking-wide relative z-10">
                        {team.name === "Korea Republic"
                          ? "Korea"
                          : team.name === "IR Iran"
                            ? "Iran"
                            : team.name === "Côte d'Ivoire"
                              ? "Ivory Coast"
                              : team.name === "Congo DR"
                                ? "DR Congo"
                                : team.name === "Bosnia and Herzegovina"
                                  ? "Bosnia"
                                  : team.name}
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center animate-pulse">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 10 10"
                            fill="none"
                          >
                            <path
                              d="M2 5l2.5 2.5L8 3"
                              stroke="white"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}

                      {/* Bottom gradient bar that expands on hover */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all duration-300 group-hover:h-1"
                        style={{
                          background: `linear-gradient(90deg, ${team.accent}, ${team.secondary}, ${team.accent})`,
                          opacity: isSelected ? 1 : 0.6,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5 text-xs text-amber-400 mb-4">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="shrink-0"
        >
          <path
            d="M7 1L1 12h12L7 1z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <line
            x1="7"
            y1="5"
            x2="7"
            y2="8.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <circle cx="7" cy="10.5" r="0.7" fill="currentColor" />
        </svg>
        This cannot be changed after you confirm.
      </div>

      {error && (
        <p className="text-red-400 text-sm mb-3 flex items-center gap-1.5">
          ⚠ {error}
        </p>
      )}

      <button
        className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-['DM_Sans'] font-semibold flex items-center justify-center gap-2 transition-all hover:bg-emerald-600 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500"
        onClick={onConfirm}
        disabled={!selectedTeam}
      >
        Claim My Passport
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

interface MintingStepProps {
  team: Team;
}

function MintingStep({ team }: MintingStepProps) {
  return (
    <div className="text-center py-10">
      <div className="flex items-center justify-center gap-2.5 mb-7">
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5" />
            <path
              d="M7 10l2 2 4-4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-['Barlow_Condensed'] text-2xl font-extrabold text-white tracking-wide">
          FanCurva
        </span>
      </div>

      <TeamFlag code={team.code} className="w-8 h-auto rounded-sm" />

      <p className="font-['Barlow_Condensed'] text-xl font-bold text-white mb-1.5">
        Minting your passport...
      </p>
      <p className="text-sm text-white/40 mb-8">
        Securing your {team.name} allegiance on-chain
      </p>

      <div className="flex items-center justify-center gap-2.5 text-white/40 text-sm">
        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <span>Please wait</span>
      </div>
    </div>
  );
}

interface SuccessStepProps {
  team: Team;
  displayName: string;
  onDashboard: () => void;
}

function SuccessStep({ team, displayName, onDashboard }: SuccessStepProps) {
  return (
    <div className="text-center animate-[fade-up_0.5s_ease_both]">
      <div className="flex items-center justify-center gap-2.5 mb-7">
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="7" stroke="white" strokeWidth="1.5" />
            <path
              d="M7 10l2 2 4-4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="font-['Barlow_Condensed'] text-2xl font-extrabold text-white tracking-wide">
          FanCurva
        </span>
      </div>

      <div
        className="relative rounded-2xl p-7 mx-auto mb-7 max-w-70 overflow-hidden animate-[passport-reveal_0.6s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_both]"
        style={{ border: `1.5px solid ${team.accent}44` }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-10"
          style={{
            background: `linear-gradient(135deg, ${team.accent}, ${team.secondary})`,
          }}
        />
        <div className="absolute inset-0 rounded-2xl border border-white/15" />
        <div className="relative z-10">
          <div className="text-[10px] tracking-[2px] uppercase text-white/45 font-semibold mb-4">
            Fan Passport · 2026
          </div>
          <TeamFlag code={team.code} className="w-8 h-auto rounded-sm" />
          <div className="font-['Barlow_Condensed'] text-3xl font-extrabold text-white mb-1">
            {team.name}
          </div>
          <div className="text-sm text-white/55 mb-5">{displayName}</div>
          <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-md px-3 py-1.5 text-xs text-white/70 font-medium">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <circle
                cx="6.5"
                cy="6.5"
                r="5"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.2"
              />
              <path
                d="M6.5 4v3l2 1"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            World Cup 2026
          </div>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full px-4 py-2 text-sm text-emerald-400 font-semibold mb-6 animate-[points-pop_0.4s_cubic-bezier(0.34,1.56,0.64,1)_0.6s_both]">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <polygon
            points="7,1 8.8,5.2 13.3,5.5 10,8.4 11,12.9 7,10.5 3,12.9 4,8.4 0.7,5.5 5.2,5.2"
            fill="#1D9E75"
          />
        </svg>
        +500 points awarded!
      </div>

      <h2 className="font-['Barlow_Condensed'] text-3xl font-extrabold text-white mb-1.5">
        Your passport is ready
      </h2>
      <p className="text-sm text-white/40 mb-7">
        Welcome to FanCurva, {displayName}.
      </p>

      <button
        className="w-full py-3.5 bg-emerald-500 text-white rounded-xl font-['DM_Sans'] font-semibold flex items-center justify-center gap-2 transition-all hover:bg-emerald-600 active:scale-98"
        onClick={onDashboard}
      >
        Continue to Dashboard
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M6 3l5 5-5 5"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Onboarding() {
  const { user, getAccessToken } = usePrivy();
  const { setUser } = useUserStore();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("profile");
  const [displayName, setDisplayName] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [error, setError] = useState("");

  const team = TEAMS.find((t) => t.code === selectedTeam);

  function handleProfileContinue() {
    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }
    setError("");
    setStep("team");
  }

  async function handleComplete() {
    if (!selectedTeam) {
      setError("Please select a team");
      return;
    }

    setError("");
    setStep("minting");

    try {
      const token = await getAccessToken();
      setAuthToken(token);

      const referral_code =
        sessionStorage.getItem("referral_code") || undefined;

      const userResponse = await usersApi.create({
        display_name: displayName,
        email: user?.email?.address,
        referral_code,
      });
      const newUser = userResponse.data.data;

      await passportsApi.mint({
        user_id: newUser.id,
        passport_type: "team",
        team_code: selectedTeam,
      });

      sessionStorage.removeItem("referral_code");

      const refreshed = await usersApi.me();
      setUser(refreshed.data.data);

      setStep("success");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Something went wrong");
      setStep("team");
    }
  }

  return (
    <div className="relative min-h-screen bg-linear-to-b from-[#0a120e] via-[#080c0a] to-[#050807] flex items-center justify-center px-6 py-10 font-['DM_Sans'] overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(29,158,117,0.12)_0%,transparent_70%)]" />
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 p-6 md:p-8 shadow-xl backdrop-blur-sm">
          {/* Top accent bar */}
          <div className="absolute top-0 left-6 right-6 h-0.5 rounded-full bg-emerald-500/60" />

          {step === "profile" && (
            <ProfileStep
              displayName={displayName}
              error={error}
              onChange={setDisplayName}
              onContinue={handleProfileContinue}
            />
          )}

          {step === "team" && (
            <TeamStep
              selectedTeam={selectedTeam}
              error={error}
              onSelect={setSelectedTeam}
              onConfirm={handleComplete}
              onBack={() => {
                setError("");
                setStep("profile");
              }}
            />
          )}

          {step === "minting" && team && <MintingStep team={team} />}

          {step === "success" && team && (
            <SuccessStep
              team={team}
              displayName={displayName}
              onDashboard={() => navigate("/dashboard")}
            />
          )}
        </div>
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(29, 158, 117, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(29, 158, 117, 0.8);
        }
        
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes passport-reveal {
          from {
            opacity: 0;
            transform: scale(0.85) rotateY(-15deg);
          }
          to {
            opacity: 1;
            transform: scale(1) rotateY(0deg);
          }
        }
        
        @keyframes points-pop {
          from {
            opacity: 0;
            transform: scale(0.7);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
