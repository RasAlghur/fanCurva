import { useState } from "react";
import logo from "../../../assets/logo-no-bg.png";

interface NavbarProps {
  onCTA: () => void;
  onLogin: () => void;
}

export default function Navbar({ onCTA, onLogin }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-6 md:px-12 py-3 sm:py-4 border-b border-white/5 backdrop-blur-md bg-[#080c0a]/80">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="FanCurva Logo"
            className="object-cover h-8 sm:h-10"
          />
        </div>

        {/* Desktop Navigation - hidden on mobile */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-white/50 font-medium">
          <a href="#how" className="hover:text-white transition-colors">
            How it works
          </a>
          <a href="#cta" className="hover:text-white transition-colors">
            CTA
          </a>
          <button
            onClick={onLogin}
            className="hover:text-white transition-colors"
          >
            Login
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-1.5 focus:outline-none"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>

        {/* Desktop CTA Button */}
        <button
          onClick={onCTA}
          className="hidden sm:block text-sm font-semibold px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-200"
        >
          Get Passport
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-[#080c0a]/95 backdrop-blur-lg transition-all duration-300 md:hidden ${
          isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        style={{ top: "56px" }}
      >
        <div className="flex flex-col items-center justify-center gap-6 h-full px-6">
          <a
            href="#how"
            onClick={handleLinkClick}
            className="text-white/70 hover:text-white text-lg font-medium transition-colors py-2"
          >
            How it works
          </a>
          <a
            href="#cta"
            onClick={handleLinkClick}
            className="text-white/70 hover:text-white text-lg font-medium transition-colors py-2"
          >
            CTA
          </a>
          <button
            onClick={() => {
              handleLinkClick();
              onLogin();
            }}
            className="text-white/70 hover:text-white text-lg font-medium transition-colors py-2"
          >
            Login
          </button>
          <button
            onClick={() => {
              handleLinkClick();
              onCTA();
            }}
            className="mt-4 w-full max-w-50 text-base font-semibold px-6 py-3 rounded-full border border-emerald-500/60 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all duration-200"
          >
            Get Passport
          </button>
        </div>
      </div>
    </>
  );
}
