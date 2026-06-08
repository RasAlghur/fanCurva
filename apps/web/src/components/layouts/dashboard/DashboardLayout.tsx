import { Link, useLocation, useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import { useUserStore } from "../../../store/userStore";
import { useState } from "react";
import logo from "../../../assets/logo-no-bg.png";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { logout } = usePrivy();
  const { reset } = useUserStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    reset();
    navigate("/");
    setIsMobileMenuOpen(false);
  }

  const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/passport", label: "Passport" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/quests", label: "Quests" },
  ];

  return (
    <div className="relative min-h-screen bg-linear-to-b from-[#0a120e] via-[#080c0a] to-[#050807] font-['DM_Sans'] text-white overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_15%_0%,rgba(29,158,117,0.15)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_85%_100%,rgba(29,158,117,0.1)_0%,transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-6 md:px-12 py-3 sm:py-4 border-b border-white/5 backdrop-blur-md bg-[#080c0a]/80">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img
            src={logo}
            alt="FanCurva Logo"
            className="object-cover h-8 sm:h-10"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`relative px-3 lg:px-4 py-2 text-[13px] lg:text-sm font-medium rounded-lg transition-all duration-200 ${
                pathname === to
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Desktop Logout Button */}
        <button
          onClick={handleLogout}
          className="hidden md:block text-sm font-medium px-4 py-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
          Logout
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-30 bg-[#080c0a]/95 backdrop-blur-lg transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ top: "56px" }}
      >
        <div className="flex flex-col items-center justify-center gap-4 h-full px-6">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`w-full max-w-50 text-center px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                pathname === to
                  ? "text-emerald-400 bg-emerald-500/15"
                  : "text-white/70 hover:text-white hover:bg-white/5"
              }`}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="w-full max-w-50 px-6 py-3 rounded-xl text-base font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-16 sm:pt-20">{children}</div>
    </div>
  );
}
