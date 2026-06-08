interface BadgeHexagonProps {
  icon: string;
  label: string;
  accent: string;
  size?: number;
  state?: "earned" | "locked" | "new";
}

export default function BadgeHexagon({
  icon,
  label,
  accent,
  size = 80,
  state = "earned",
}: BadgeHexagonProps) {
  const isLocked = state === "locked";
  const isNew = state === "new";

  // Hexagon clip path via polygon
  const hexClip = "polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)";

  return (
    <div
      className="flex flex-col items-center gap-2 shrink-0"
      style={{ width: size + 24 }}
    >
      <div className="relative" style={{ width: size, height: size }}>
        {/* new badge pulsing ring */}
        {isNew && (
          <div
            className="absolute inset-0 animate-[badge-pulse_2s_ease-in-out_infinite]"
            style={{
              clipPath: hexClip,
              background: "#1D9E75",
              opacity: 0.35,
              transform: "scale(1.18)",
            }}
          />
        )}

        {/* glow behind hex for earned */}
        {!isLocked && (
          <div
            className="absolute inset-0 scale-[1.1] blur-[10px] opacity-40"
            style={{
              clipPath: hexClip,
              background: accent,
            }}
          />
        )}

        {/* hex body */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            clipPath: hexClip,
            background: isLocked
              ? "#1a1a1a"
              : `linear-gradient(145deg, ${accent}33 0%, ${accent}18 100%)`,
            border: `1.5px solid ${isLocked ? "#333" : accent}`,
            filter: isLocked ? "grayscale(1) opacity(0.4)" : undefined,
          }}
        >
          {/* inner hex border ring */}
          <div
            className="absolute inset-1.5"
            style={{
              clipPath: hexClip,
              border: `1px solid ${isLocked ? "#444" : `${accent}50`}`,
            }}
          />

          <span
            className="relative z-10 select-none"
            style={{
              fontSize: size * 0.36,
              filter: isLocked ? "grayscale(1)" : undefined,
            }}
          >
            {icon}
          </span>

          {/* lock overlay */}
          {isLocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                width={size * 0.28}
                height={size * 0.28}
                viewBox="0 0 24 24"
                fill="none"
                className="opacity-60"
              >
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="10"
                  rx="2"
                  stroke="#888"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 11V7a4 4 0 0 1 8 0v4"
                  stroke="#888"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* label */}
      <span
        className="text-[10px] font-semibold uppercase tracking-widest text-center leading-tight"
        style={{ color: isLocked ? "#555" : `${accent}cc` }}
      >
        {label}
      </span>
    </div>
  );
}
