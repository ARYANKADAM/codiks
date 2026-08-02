import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Friendship } from "@/models/Friendship";
import { UserProfileView } from "@/components/people/user-profile-view";

export default async function PublicProfilePage({ params }) {
  const { userId } = await auth();
  const { clerkId } = await params;

  if (clerkId === userId) {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard/profile");
  }

  await connectDB();
 const [me, target] = await Promise.all([
    User.findOne({ clerkId: userId }).select("_id").lean(),
    User.findOne({ clerkId }).select("clerkId username avatarUrl bannerUrl mathRating csQuizRating mathStats csQuizStats").lean(),
  ]);
  if (!target) notFound();

  const relation = await Friendship.findOne({
    $or: [
      { requester: me._id, recipient: target._id },
      { requester: target._id, recipient: me._id },
    ],
  });

  let friendStatus = "none";
  if (relation) {
    if (relation.status === "accepted") friendStatus = "friend";
    else friendStatus = String(relation.requester) === String(me._id) ? "outgoing" : "incoming";
  }

  return (
    <UserProfileView
      user={{
        clerkId: target.clerkId,
        username: target.username,
        avatarUrl: target.avatarUrl,
        bannerUrl: target.bannerUrl,
        mathRating: target.mathRating,
        csQuizRating: target.csQuizRating,
        mathStats: target.mathStats,
        csQuizStats: target.csQuizStats,
      }}
      friendStatus={friendStatus}
      requestId={relation ? String(relation._id) : null}
    />
  );
}