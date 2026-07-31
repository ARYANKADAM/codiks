import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";

export const metadata = { title: "Leaderboard" };

const PAGE_SIZE = 50;

export default async function LeaderboardPage() {
  const { userId } = await auth();
  await connectDB();

  const topUsers = await User.find({})
    .sort({ rating: -1 })
    .limit(PAGE_SIZE)
    .select("clerkId username avatarUrl rating stats")
    .lean();

  let currentUserEntry = null;
  const isInTop = topUsers.some((u) => u.clerkId === userId);

  if (userId && !isInTop) {
    const me = await User.findOne({ clerkId: userId }).select("clerkId username avatarUrl rating stats").lean();
    if (me) {
      const higherRatedCount = await User.countDocuments({ rating: { $gt: me.rating } });
      currentUserEntry = { ...me, rank: higherRatedCount + 1 };
    }
  }

  const entries = topUsers.map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">Top {PAGE_SIZE} players by rating, globally.</p>
      </div>
      <LeaderboardTable entries={entries} currentUserClerkId={userId} currentUserEntry={currentUserEntry} />
    </div>
  );
}