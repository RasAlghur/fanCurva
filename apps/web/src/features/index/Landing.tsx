import { usePrivy } from "@privy-io/react-auth";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import {
  Navbar,
  Hero,
  // Ticker,
  HowItWorks,
  // RewardsGrid,
  StatsBar,
  NeutralFanCallout,
  CTASection,
  Footer,
} from "./components";
import BadgeTicker from "./components/BadgeTicker";

export default function Landing() {
  const { authenticated } = usePrivy();
  const { isOnboarded } = useUserStore();
  const navigate = useNavigate();

  function handleCTA() {
    if (authenticated && isOnboarded) navigate("/dashboard");
    else if (authenticated) navigate("/onboarding");
    else navigate("/login");
  }

  return (
    <div className="bg-[#080c0a] text-white font-['DM_Sans',sans-serif] overflow-x-hidden">
      <Navbar onCTA={handleCTA} onLogin={() => navigate("/login")} />
      <Hero onCTA={handleCTA} />
      <BadgeTicker />
      <StatsBar />
      <HowItWorks />
      {/* <RewardsGrid /> */}

      <NeutralFanCallout onCTA={handleCTA} />
      <CTASection onCTA={handleCTA} />
      <Footer />
    </div>
  );
}
