import ChampionCard from "./champion-card";

export function LeaderboardPodium({ entries }) {
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <section className="py-6 sm:py-8">

      <div className="grid items-stretch gap-4 sm:gap-5 lg:items-end lg:grid-cols-3 lg:gap-6">

        <div className="order-2 lg:order-1">

          <ChampionCard
            entry={second}
            rank={2}
          />

        </div>

        <div className="order-1 lg:order-2">

          <ChampionCard
            entry={first}
            rank={1}
            featured
          />

        </div>

        <div className="order-3">

          <ChampionCard
            entry={third}
            rank={3}
          />

        </div>

      </div>

    </section>
  );
}

export default LeaderboardPodium;