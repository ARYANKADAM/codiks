import LeaderboardRow from "./leaderboard-row";

export function LeaderboardList({
  entries,
  currentUserClerkId,
  currentUserEntry,
}) {
  return (
    <section>

      <div className="mb-5 flex items-center justify-between sm:mb-8">

        <div>

          <h2 className="text-xl font-bold sm:text-2xl lg:text-3xl">

            Top Players

          </h2>

          <p className="text-sm text-muted-foreground sm:text-base">

            Global rankings updated live.

          </p>

        </div>

      </div>

      <div className="space-y-2 sm:space-y-3 lg:space-y-4">

        {entries.map((entry) => (

          <LeaderboardRow
            key={entry.clerkId}
            entry={entry}
            isMe={entry.clerkId === currentUserClerkId}
          />

        ))}

      </div>

      {currentUserEntry && (

        <div className="mt-8 sm:mt-10 lg:mt-12">

          <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">

            Your Position

          </h3>

          <LeaderboardRow
            entry={currentUserEntry}
            isMe
          />

        </div>

      )}

    </section>
  );
}

export default LeaderboardList;