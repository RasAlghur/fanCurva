/* eslint-disable react-refresh/only-export-components */
import { useState } from "react";
import "../PassportCard.css";
import logo from "../../../assets/logo-no-bg.png";
import TeamFlag from "../../../components/TeamFlag";
import { getTeamByCode, type Team } from "../../../constants/teams";

/* ─── Tier config ────────────────────────────────────────── */
export const TIER_CONFIG: Record<
  string,
  { color: string; bg: string; border: string; label: string; icon: string }
> = {
  supporter: {
    color: "#888780",
    bg: "#1a1a1a",
    border: "#3a3a38",
    label: "Supporter",
    icon: "★",
  },
  true_fan: {
    color: "#4A9EFF",
    bg: "#0f1e30",
    border: "#4A9EFF",
    label: "True Fan",
    icon: "♦",
  },
  ultras: {
    color: "#C084FC",
    bg: "#1a0f26",
    border: "#C084FC",
    label: "Ultras",
    icon: "☠",
  },
  legend: {
    color: "#FFD700",
    bg: "#1f1500",
    border: "#FFD700",
    label: "Legend",
    icon: "♛",
  },
};

/* ─── Props ──────────────────────────────────────────────── */
export interface PassportCardProps {
  displayName: string;
  points: number;
  statusTier: string;
  /** FIFA team code e.g. "BRA", "ARG", "USA" */
  teamCode?: string;
  passportType?: string;
  issuedAt?: string;
}

/* ──────────────────────────────────────────────────────────
   FRONT FACE
   ────────────────────────────────────────────────────────── */
function PassportFront({
  displayName,
  points,
  statusTier,
  teamCode,
  passportType = "Fan Passport",
  issuedAt,
}: PassportCardProps) {
  // Get team data from the shared TEAMS array
  const team = teamCode ? getTeamByCode(teamCode) : undefined;

  // Fallback for when no team is selected or team not found
  const defaultTeam: Team = {
    code: "default",
    name: "Tournament",
    accent: "#1D9E75",
    secondary: "#085041",
    continent: "Global",
  };

  const activeTeam = team || defaultTeam;
  const tier = TIER_CONFIG[statusTier] ?? TIER_CONFIG.supporter;

  const issued = issuedAt
    ? new Date(issuedAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="pnft-front">
      <div className="pnft-f-base" />
      <div
        className="pnft-f-splash"
        style={{
          background: `radial-gradient(circle, ${activeTeam.secondary}55 0%, ${activeTeam.accent}22 45%, transparent 70%)`,
        }}
      />
      <svg
        className="pnft-f-crowd"
        viewBox="0 0 400 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="pnft-crowd-pat"
            x="0"
            y="0"
            width="28"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <ellipse cx="7" cy="18" rx="4.5" ry="2.5" fill="white" />
            <ellipse cx="7" cy="12" rx="2.8" ry="3.8" fill="white" />
            <ellipse cx="21" cy="17" rx="4.5" ry="2.5" fill="white" />
            <ellipse cx="21" cy="11" rx="2.8" ry="3.8" fill="white" />
            <ellipse cx="14" cy="19" rx="3.5" ry="2" fill="white" />
            <ellipse cx="14" cy="14" rx="2.2" ry="3.2" fill="white" />
          </pattern>
        </defs>
        <rect width="400" height="600" fill="url(#pnft-crowd-pat)" />
      </svg>

      <div className="pnft-f-strip" style={{ background: activeTeam.accent }} />

      <div className="pnft-f-body">
        {/* header */}
        <div className="pnft-f-header">
          <div className="pnft-logo-hero">
            <div>
              <img
                src={logo}
                alt="FanCurva Logo"
                className="object-contain h-10 -ml-4"
              />
              <div className="pnft-logo__sub-hero">World Cup 2026</div>
            </div>
          </div>
          <div className="pnft-f-corner" />
        </div>

        {/* fan name */}
        <div className="pnft-f-name">{displayName}</div>

        {/* meta fields */}
        <div className="pnft-f-fields">
          <div className="pnft-field">
            <span className="pnft-field__label">Passport Type</span>
            <span className="pnft-field__value">{passportType}</span>
          </div>
          <div className="pnft-field">
            <span className="pnft-field__label">Team</span>
            <span className="pnft-field__value">
              {activeTeam.name}
              <span className="pnft-field__flag">
                {/* Use TeamFlag component with FIFA code */}
                {teamCode && (
                  <TeamFlag
                    code={teamCode}
                    className="w-5 h-auto inline-block ml-1"
                  />
                )}
              </span>
            </span>
          </div>
          <div className="pnft-field pnft-field--tier">
            <span className="pnft-field__label">Tier</span>
            <div
              className="pnft-tier-badge w-fit"
              style={{
                background: tier.bg,
                borderColor: tier.border,
                color: tier.color,
              }}
            >
              <div
                className="pnft-tier-badge__hex"
                style={{ background: tier.color, color: tier.bg }}
              >
                {tier.icon}
              </div>
              <span
                className="pnft-tier-badge__name"
                style={{ color: tier.color }}
              >
                {tier.label}
              </span>
            </div>
          </div>
        </div>

        {/* bottom data grid */}
        <div className="pnft-f-bottom">
          <div className="pnft-bottom-cell">
            <span className="pnft-bc-label">Points</span>
            <span className="pnft-bc-value pnft-bc-value--green">
              {points.toLocaleString()}
            </span>
          </div>

          <div className="pnft-bottom-cell">
            <span className="pnft-bc-label">Issued</span>
            <span className="pnft-bc-value">{issued}</span>
          </div>
          <div className="pnft-bottom-cell">
            <span className="pnft-bc-label">Valid For</span>
            <span
              className="pnft-bc-value"
              style={{ fontSize: "13px", opacity: 0.75 }}
            >
              World Cup 2026
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   BACK FACE
   ────────────────────────────────────────────────────────── */
function PassportBack() {
  return (
    <div className="pnft-back">
      <div className="pnft-back__bg" />
      <div className="pnft-back__tex" />
      <div className="pnft-back__vignette" />

      {/* globe watermark SVG */}
      <svg
        className="pnft-back__globe"
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="46" stroke="white" strokeWidth="1.8" />
        <ellipse
          cx="50"
          cy="50"
          rx="20"
          ry="46"
          stroke="white"
          strokeWidth="1.3"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="38"
          ry="46"
          stroke="white"
          strokeWidth="0.8"
        />
        <line x1="4" y1="50" x2="96" y2="50" stroke="white" strokeWidth="1.3" />
        <path d="M7 35 Q50 27 93 35" stroke="white" strokeWidth="0.8" />
        <path d="M7 65 Q50 73 93 65" stroke="white" strokeWidth="0.8" />
        <path d="M18 20 Q50 14 82 20" stroke="white" strokeWidth="0.6" />
        <path d="M18 80 Q50 86 82 80" stroke="white" strokeWidth="0.6" />
      </svg>

      <div className="pnft-back__body">
        <div className="pnft-back__logorow">
          <img
            src={logo}
            alt="FanCurva Logo"
            className="object-contain h-10 -ml-4"
          />
        </div>

        <span className="pnft-back__wc">World Cup 2026</span>
        <div className="pnft-back__divider" />
        <span className="pnft-back__fp">Fan Passport</span>
        <span className="pnft-back__tag">Your Passion. Your Journey.</span>

        {/* small icon row at bottom */}
        <div className="pnft-back__icon-row">
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <rect
              x="1"
              y="1"
              width="14"
              height="14"
              rx="3"
              stroke="white"
              strokeWidth="1.2"
            />
            <circle cx="8" cy="8" r="3.5" stroke="white" strokeWidth="1" />
            <line
              x1="4"
              y1="4"
              x2="5.5"
              y2="5.5"
              stroke="white"
              strokeWidth="1"
            />
            <line
              x1="12"
              y1="4"
              x2="10.5"
              y2="5.5"
              stroke="white"
              strokeWidth="1"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   EXPORTED COMPONENT — flips on click
   ────────────────────────────────────────────────────────── */
export default function PassportHeroCard(props: PassportCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="pnft-scene"
      onClick={() => setFlipped((v) => !v)}
      role="button"
      tabIndex={0}
      aria-label="Fan passport card — click to flip"
      onKeyDown={(e) => e.key === "Enter" && setFlipped((v) => !v)}
    >
      <div className={`pnft-card${flipped ? " pnft-card--flipped" : ""}`}>
        <PassportFront {...props} />
        <PassportBack />
      </div>
    </div>
  );
}
