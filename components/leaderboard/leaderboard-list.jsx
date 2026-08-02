import LeaderboardRow from "./leaderboard-row";

export function LeaderboardList({
  entries,
  currentUserClerkId,
  currentUserEntry,
}) {
  return (
    <section>

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold">

            Top Players

          </h2>

          <p className="text-muted-foreground">

            Global rankings updated live.

          </p>

        </div>

      </div>

      <div className="space-y-4">

        {entries.map((entry) => (

          <LeaderboardRow
            key={entry.clerkId}
            entry={entry}
            isMe={entry.clerkId === currentUserClerkId}
          />

        ))}

      </div>

      {currentUserEntry && (

        <div className="mt-12">

          <h3 className="mb-4 text-lg font-semibold">

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