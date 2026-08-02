import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Friendship } from "@/models/Friendship";
import { getShowcasedAchievements } from "@/lib/achievement-service";
import { getFriendsData } from "@/lib/friends-service";
import { ProfileContent } from "@/components/profile/profile-content";

export default async function PublicProfilePage({ params }) {
  const { userId } = await auth();
  const { clerkId } = await params;
  if (clerkId === userId) redirect("/dashboard/profile");

  await connectDB();
  const [me, target] = await Promise.all([
    User.findOne({ clerkId: userId }).select("_id").lean(),
    User.findOne({ clerkId })
      .select("clerkId username avatarUrl bannerUrl createdAt mathRating csQuizRating mathStats csQuizStats bestDailyStreak")
      .lean(),
  ]);
  if (!target) notFound();

  const relation = await Friendship.findOne({
    $or: [
      { requester: me._id, recipient: target._id },
      { requester: target._id, recipient: me._id },
    ],
  }).lean();

  let friendStatus = "none";
  if (relation) {
    if (relation.status === "accepted") friendStatus = "friend";
    else friendStatus = String(relation.requester) === String(me._id) ? "outgoing" : "incoming";
  }

  const [achievements, friendsData] = await Promise.all([
    getShowcasedAchievements(clerkId),
    getFriendsData(clerkId),
  ]);

  return (
    <ProfileContent
      targetClerkId={target.clerkId}
      isOwner={false}
      username={target.username}
      avatarUrl={target.avatarUrl}
      bannerUrl={target.bannerUrl}
      memberSince={target.createdAt}
      profile={{
        mathRating: target.mathRating,
        csQuizRating: target.csQuizRating,
        mathStats: target.mathStats,
        csQuizStats: target.csQuizStats,
        bestDailyStreak: target.bestDailyStreak,
      }}
      achievements={achievements}
      friendsCount={friendsData.friends.length}
      friendStatus={friendStatus}
      requestId={relation ? String(relation._id) : null}
    />
  );
}