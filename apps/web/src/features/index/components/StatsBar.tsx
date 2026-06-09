import CountUpStat from "../../../components/CountUpStat";

const STATS = [
  { value: "50000", suffix: "+", label: "Fans Joined" },
  { value: "64", suffix: "", label: "Matches Played" },
  { value: "200", suffix: "+", label: "Badges Earned" },
];

export default function StatsBar() {
  return (
    <section className="py-16 px-6 md:px-16 xl:px-24">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map(({ value, suffix, label }, i) => (
          <CountUpStat
            key={label}
            value={value}
            suffix={suffix}
            label={label}
            delay={i * 100}
          />
        ))}
      </div>
    </section>
  );
}
