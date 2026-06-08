const ITEMS = [
  "⚽ Group Stage · June 11–27",
  "🏟 64 Matches",
  "🌍 48 Teams",
  "🥇 200+ Badges",
  "🎯 Trivia Quests",
  "🤝 Referral Rewards",
  "🏆 Finals · July 19",
  "📍 USA · Canada · Mexico",
];

export default function Ticker() {
  return (
    <div className="ticker-wrap">
      <div className="ticker">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
