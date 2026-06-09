/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useUserStore } from "../../store/userStore";
import {
  passportsApi,
  badgesApi,
  referralsApi,
  // questsApi,
} from "../../lib/api";
import PassportHeroCard from "./components/PassportHeroCard";
import ReferralSection from "../../components/ReferralSection";
import BadgeCollection from "../../components/BadgeCollection";
// import QuestHistory from "../../components/QuestHistory";

export default function Passport() {
  const { user } = useUserStore();

  const [passport, setPassport] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [referralLink, setReferralLink] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [passportRes, badgesRes, referralRes] = await Promise.allSettled([
          passportsApi.get(user.id),
          badgesApi.myBadges(user.id),
          referralsApi.getLink(user.id),
        ]);

        if (passportRes.status === "fulfilled") {
          setPassport(passportRes.value.data.data);
        }
        if (badgesRes.status === "fulfilled") {
          setBadges(badgesRes.value.data.data);
        }
        if (referralRes.status === "fulfilled") {
          setReferralLink(referralRes.value.data.data);
        }
      } catch (error) {
        console.error("Error fetching passport data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="relative min-h-screen bg-linear-to-b from-[#0a120e] via-[#080c0a] to-[#050807] font-['DM_Sans'] text-white flex items-center justify-center">
        {/* Ambient background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_15%_0%,rgba(29,158,117,0.15)_0%,transparent_65%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_85%_100%,rgba(29,158,117,0.1)_0%,transparent_60%)]" />
          <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
        </div>

        {/* Loading spinner */}
        <div className="relative z-10 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-white/50">Loading your passport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-linear-to-b from-[#0a120e] via-[#080c0a] to-[#050807] font-['DM_Sans'] text-white">
      {/* Dashboard-style ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_35%_at_15%_0%,rgba(29,158,117,0.15)_0%,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_85%_100%,rgba(29,158,117,0.1)_0%,transparent_60%)]" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Page header */}
        <div className="mx-auto max-w-275 px-5 pt-10 md:px-12">
          <p className="mb-2 font-['DM_Sans'] text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
            Identity
          </p>
          <h1 className="font-['Barlow_Condensed'] text-[clamp(44px,5.5vw,68px)] font-extrabold uppercase tracking-[-0.01em] text-white">
            Fan{" "}
            <span className="bg-linear-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
              Passport
            </span>
          </h1>
        </div>

        {/* Grid layout */}
        <div className="mx-auto max-w-275 px-5 pb-16 md:px-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
            {/* LEFT — passport card, sticky */}
            <div className="lg:sticky lg:top-30">
              <PassportHeroCard
                displayName={user.display_name}
                points={user.points}
                statusTier={user.status_tier}
                teamCode={passport?.team_code ?? user.team_code}
                passportType={passport?.passport_type}
                issuedAt={user.created_at}
              />
            </div>

            {/* RIGHT — info panels, scrollable */}
            <div className="flex flex-col gap-5 min-w-0">
              {referralLink && <ReferralSection referralLink={referralLink} />}
              <BadgeCollection badges={badges} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
