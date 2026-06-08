import logo from "../../../assets/logo-no-bg.png";
import TeamFlag from "../../../components/TeamFlag";

interface HeroProps {
  onCTA: () => void;
}

export default function Hero({ onCTA }: HeroProps) {
  return (
    <section className="relative min-h-screen flex items-center pt-24 md:pt-28 lg:pt-10 pb-16 max-w-6xl mx-auto">
      {/* glow */}
      <div className="absolute inset-0 hero-glow pointer-events-none" />

      {/* subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-7xl mx-auto px-5 md:px-12 flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-16 py-12 md:py-16 lg:py-24">
        {/* ── LEFT COPY ── */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[11px] md:text-xs font-semibold tracking-widest uppercase mb-5 md:mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            World Cup 2026 · June 11 – July 19
          </div>

          <h1 className="font-display font-black leading-[0.92] mb-5 md:mb-6">
            <span className="block text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] text-white tracking-tight">
              YOUR
            </span>
            <span className="block text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] text-gold tracking-tight">
              PASSPORT
            </span>
            <span className="block text-[48px] sm:text-[64px] md:text-[80px] lg:text-[96px] text-white tracking-tight">
              TO THE CUP
            </span>
          </h1>

          <p className="text-white/55 text-base md:text-lg leading-relaxed mb-4 font-light">
            Collect badges. Complete missions. Represent your team. Every match,
            every goal —{" "}
            <span className="text-white/80 font-medium">
              earned and owned forever.
            </span>
          </p>
          <p className="text-white/35 text-xs md:text-sm mb-0">
            No crypto knowledge needed · Free to join · 200+ badges to earn
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8">
            <button
              onClick={onCTA}
              className="font-display font-bold text-base md:text-lg tracking-wide px-8 md:px-10 py-3 md:py-4 rounded-xl bg-emerald-500 text-white transition-all duration-200 hover:bg-emerald-600 hover:scale-105 active:scale-95"
            >
              GET YOUR PASSPORT →
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("how")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="px-6 md:px-8 py-3 md:py-4 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 text-sm font-medium transition-all duration-200"
            >
              See how it works
            </button>
          </div>
        </div>

        {/* ── RIGHT: REDESIGNED PASSPORT CARD ── */}
        <div className="flex-1 flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="relative w-70 sm:w-[320px] md:w-90 lg:w-95">
            {/* glow behind card */}
            <div className="absolute inset-0 blur-3xl bg-emerald-500/20 rounded-3xl scale-95" />

            {/* passport card - 3D flip container */}
            <div className="pnft-scene-hero">
              <div className="pnft-card-hero">
                {/* FRONT FACE */}
                <div className="pnft-front-hero">
                  <div className="pnft-f-base-hero" />
                  <div
                    className="pnft-f-splash-hero"
                    style={{
                      background: `radial-gradient(circle, #FFDF0055 0%, #009C3B22 45%, transparent 70%)`,
                    }}
                  />
                  <svg
                    className="pnft-f-crowd-hero"
                    viewBox="0 0 400 600"
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="pnft-crowd-pat-hero"
                        x="0"
                        y="0"
                        width="28"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <ellipse
                          cx="7"
                          cy="18"
                          rx="4.5"
                          ry="2.5"
                          fill="white"
                        />
                        <ellipse
                          cx="7"
                          cy="12"
                          rx="2.8"
                          ry="3.8"
                          fill="white"
                        />
                        <ellipse
                          cx="21"
                          cy="17"
                          rx="4.5"
                          ry="2.5"
                          fill="white"
                        />
                        <ellipse
                          cx="21"
                          cy="11"
                          rx="2.8"
                          ry="3.8"
                          fill="white"
                        />
                        <ellipse cx="14" cy="19" rx="3.5" ry="2" fill="white" />
                        <ellipse
                          cx="14"
                          cy="14"
                          rx="2.2"
                          ry="3.2"
                          fill="white"
                        />
                      </pattern>
                    </defs>
                    <rect
                      width="400"
                      height="600"
                      fill="url(#pnft-crowd-pat-hero)"
                    />
                  </svg>

                  <div
                    className="pnft-f-strip-hero"
                    style={{ background: "#009C3B" }}
                  />

                  <div className="pnft-f-body-hero">
                    {/* header */}
                    <div className="pnft-f-header-hero">
                      <div className="pnft-logo-hero">
                        <div>
                          <img
                            src={logo}
                            alt="FanCurva Logo"
                            className="object-contain h-10 -ml-4"
                          />
                          <div className="pnft-logo__sub-hero">
                            World Cup 2026
                          </div>
                        </div>
                      </div>
                      <div className="pnft-f-corner-hero" />
                    </div>

                    {/* fan name */}
                    <div className="pnft-f-name-hero">SambaFan99</div>

                    {/* meta fields */}
                    <div className="pnft-f-fields-hero space-y-2">
                      <div className="pnft-field-hero">
                        <span className="pnft-field__label-hero">
                          Passport Type
                        </span>
                        <span className="pnft-field__value-hero">
                          Fan Passport
                        </span>
                      </div>
                      <div className="pnft-field-hero">
                        <span className="pnft-field__label-hero">Team</span>
                        <span className="pnft-field__value-hero">
                          Brazil
                          <TeamFlag
                            code="BRA"
                            className="size-10 h-auto rounded-sm inline-block ml-1"
                          />
                        </span>
                      </div>
                      <div className="pnft-field-hero pnft-field--tier-hero w-fit">
                        <span className="pnft-field__label-hero">Tier</span>
                        <div
                          className="pnft-tier-badge-hero"
                          style={{
                            background: "#0f1e30",
                            borderColor: "#4A9EFF",
                            color: "#4A9EFF",
                          }}
                        >
                          <div
                            className="pnft-tier-badge__hex-hero"
                            style={{ background: "#4A9EFF", color: "#0f1e30" }}
                          >
                            ♦
                          </div>
                          <span
                            className="pnft-tier-badge__name-hero"
                            style={{ color: "#4A9EFF" }}
                          >
                            True Fan
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* bottom data grid */}
                    <div className="pnft-f-bottom-hero">
                      <div className="pnft-bottom-cell-hero">
                        <span className="pnft-bc-label-hero">Points</span>
                        <span className="pnft-bc-value-hero pnft-bc-value--green-hero">
                          1,240
                        </span>
                      </div>
                      <div className="pnft-bottom-cell-hero">
                        <span className="pnft-bc-label-hero">Passport No.</span>
                        <span className="pnft-bc-value-hero pnft-bc-value--mono-hero">
                          FC26-XXX-001
                        </span>
                      </div>
                      <div className="pnft-bottom-cell-hero">
                        <span className="pnft-bc-label-hero">Issued</span>
                        <span className="pnft-bc-value-hero">Jun 2026</span>
                      </div>
                      <div className="pnft-bottom-cell-hero">
                        <span className="pnft-bc-label-hero">Valid For</span>
                        <span
                          className="pnft-bc-value-hero"
                          style={{ fontSize: "13px", opacity: 0.75 }}
                        >
                          World Cup 2026
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BACK FACE */}
                <div className="pnft-back-hero">
                  <div className="pnft-back__bg-hero" />
                  <div className="pnft-back__tex-hero" />
                  <div className="pnft-back__vignette-hero" />

                  <svg
                    className="pnft-back__globe-hero"
                    viewBox="0 0 100 100"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      stroke="white"
                      strokeWidth="1.8"
                    />
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
                    <line
                      x1="4"
                      y1="50"
                      x2="96"
                      y2="50"
                      stroke="white"
                      strokeWidth="1.3"
                    />
                    <path
                      d="M7 35 Q50 27 93 35"
                      stroke="white"
                      strokeWidth="0.8"
                    />
                    <path
                      d="M7 65 Q50 73 93 65"
                      stroke="white"
                      strokeWidth="0.8"
                    />
                    <path
                      d="M18 20 Q50 14 82 20"
                      stroke="white"
                      strokeWidth="0.6"
                    />
                    <path
                      d="M18 80 Q50 86 82 80"
                      stroke="white"
                      strokeWidth="0.6"
                    />
                  </svg>

                  <div className="pnft-back__body-hero">
                    <div className="pnft-back__logorow-hero">
                      <div className="pnft-back__mark-hero">
                        <svg
                          width="18"
                          height="14"
                          viewBox="0 0 17 13"
                          fill="none"
                        >
                          <path
                            d="M8.5 12 L8.5 12"
                            stroke="#1D9E75"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M5.5 9.5 Q8.5 6.5 11.5 9.5"
                            stroke="#1D9E75"
                            strokeWidth="1.6"
                            fill="none"
                            strokeLinecap="round"
                          />
                          <path
                            d="M2.5 6.5 Q8.5 0.5 14.5 6.5"
                            stroke="#1D9E75"
                            strokeWidth="1.4"
                            fill="none"
                            strokeLinecap="round"
                          />
                          <path
                            d="M0 3.5 Q8.5 -3 17 3.5"
                            stroke="#1D9E75"
                            strokeWidth="1.2"
                            fill="none"
                            strokeLinecap="round"
                            opacity="0.5"
                          />
                        </svg>
                      </div>
                      <span className="pnft-back__brandname-hero">
                        FanCurva
                      </span>
                    </div>

                    <span className="pnft-back__wc-hero">World Cup 2026</span>
                    <div className="pnft-back__divider-hero" />
                    <span className="pnft-back__fp-hero">Fan Passport</span>
                    <span className="pnft-back__tag-hero">
                      Your Passion. Your Journey.
                    </span>

                    <div className="pnft-back__icon-row-hero">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <rect
                          x="1"
                          y="1"
                          width="14"
                          height="14"
                          rx="3"
                          stroke="white"
                          strokeWidth="1.2"
                        />
                        <circle
                          cx="8"
                          cy="8"
                          r="3.5"
                          stroke="white"
                          strokeWidth="1"
                        />
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
              </div>
            </div>

            {/* floating elements */}
            <div className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 bg-emerald-500 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 border border-emerald-500/50 shadow-lg animate-pulse">
              <span className="text-xs sm:text-sm">🏅</span>
              <span className="text-[10px] sm:text-xs font-bold text-white whitespace-nowrap">
                +25 pts earned!
              </span>
            </div>

            <div className="absolute -bottom-3 -left-2 sm:-bottom-4 sm:-left-4 bg-[#0f1a15] border border-white/10 rounded-xl sm:rounded-2xl px-2 sm:px-3 py-1.5 sm:py-2 flex items-center gap-1 sm:gap-2 shadow-lg">
              <span className="text-xs sm:text-sm">⚡</span>
              <div className="text-left">
                <p className="text-[8px] sm:text-[10px] text-white/40">
                  Active quest
                </p>
                <p className="text-[10px] sm:text-xs font-semibold text-white whitespace-nowrap">
                  Match check-in
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
