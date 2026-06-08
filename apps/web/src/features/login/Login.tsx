import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import "./Login.css";

export default function Login() {
  const { login, authenticated, ready } = usePrivy();
  const { isOnboarded } = useUserStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref");

  if (ref) sessionStorage.setItem("referral_code", ref);

  useEffect(() => {
    if (!ready) return;
    if (authenticated && isOnboarded) navigate("/dashboard");
    else if (authenticated) navigate("/onboarding");
  }, [ready, authenticated, isOnboarded, navigate]);

  return (
    <div className="login-root">
      {/* background */}
      <div className="login-bg-glow" aria-hidden="true" />
      <div className="login-pitch-lines" aria-hidden="true" />

      {/* corner decorations */}
      <svg
        className="login-corner-flag login-corner-flag--tl"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="0"
          cy="0"
          r="160"
          stroke="#1D9E75"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="0"
          cy="0"
          r="120"
          stroke="#1D9E75"
          strokeWidth="1"
          fill="none"
        />
        <circle
          cx="0"
          cy="0"
          r="80"
          stroke="#1D9E75"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>

      <svg
        className="login-corner-flag login-corner-flag--br"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="0"
          cy="0"
          r="160"
          stroke="#f5c842"
          strokeWidth="1.5"
          fill="none"
        />
        <circle
          cx="0"
          cy="0"
          r="110"
          stroke="#f5c842"
          strokeWidth="0.8"
          fill="none"
        />
      </svg>

      {/* card */}
      <div className="login-card" role="main">
        {/* logo */}

        {/* back navigation */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-5 left-5 flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs transition-colors duration-150"
        >
          ← Back
        </button>
        <div className="login-logo">
          <div className="login-logo-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 2c.93 0 1.83.13 2.68.37L12 7.5 9.32 4.37A7.96 7.96 0 0 1 12 4zM7.1 5.26l2.08 3.6-3.95 2.87A7.96 7.96 0 0 1 4 12c0-.74.1-1.46.27-2.15L7.1 5.26zM16.9 5.26l2.83 4.59c.17.69.27 1.41.27 2.15 0-.74-.1-1.46-.27-2.15L16.9 5.26zM12 9.5l2.68 1.95-1.02 3.14H10.34L9.32 11.45 12 9.5zm-5.77.88 3.43 1.07.97 2.98-2.26 3.1A8.03 8.03 0 0 1 4 12c0-.57.06-1.13.17-1.67l2.06-.95zm11.54 0 2.06.95c.11.54.17 1.1.17 1.67a8.03 8.03 0 0 1-4.37 7.13l-2.26-3.1.97-2.98 3.43-1.07zM10.05 19.1l1.95-2.68 1.95 2.68a8.08 8.08 0 0 1-3.9 0z" />
            </svg>
          </div>
          <div className="login-wordmark">
            Fan<span>Curva</span>
          </div>
        </div>

        {/* tournament badge */}
        <div
          className="login-tournament-badge"
          aria-label="FIFA World Cup 2026"
        >
          FIFA World Cup 2026
        </div>

        {/* headline — Barlow Condensed 700 32px per spec */}
        <h1 className="login-heading">CLAIM YOUR PASSPORT</h1>

        <p className="login-subheading">
          Collect badges, complete quests, and climb the global leaderboard
          across 48 matches.
        </p>

        {/* referral notice — spec copy */}
        {ref && (
          <div className="login-referral-notice" role="note">
            <div className="login-referral-icon" aria-hidden="true">
              🎁
            </div>
            <div>
              You were invited by a fan. You will receive{" "}
              <strong>50 bonus points</strong> on signup.
            </div>
          </div>
        )}

        {/* CTA */}
        <button
          className="login-btn"
          onClick={login}
          disabled={!ready}
          aria-label="Sign in or create a FanCurva account"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          {!ready ? "Loading…" : "Sign In / Sign Up"}
        </button>

        {/* spec note */}
        <p className="login-wallet-note">
          No wallet required. Sign in with email.
        </p>

        {/* divider */}
        <div className="login-divider" aria-hidden="true">
          <span>Why fans trust us</span>
        </div>

        {/* trust signals */}
        <div className="login-trust" role="list">
          {[
            {
              label:
                "No crypto knowledge required — wallet created automatically",
              icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
            },
            {
              label: "Sign in with email — no passwords to remember",
              icon: (
                <>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </>
              ),
            },
            {
              label: "Free to play. Badges and rewards are yours to keep",
              icon: <polyline points="20 6 9 17 4 12" />,
            },
          ].map(({ label, icon }) => (
            <div className="login-trust-item" role="listitem" key={label}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {icon}
              </svg>
              {label}
            </div>
          ))}
        </div>

        {/* footer note */}
        <p className="login-footer-note">
          By continuing, you agree to our <a href="/terms">Terms of Service</a>{" "}
          and <a href="/privacy">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
