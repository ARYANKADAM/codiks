import { currentUser } from "@clerk/nextjs/server";
import { getDashboardData } from "@/lib/dashboard-service";
import { getShowcasedAchievements } from "@/lib/achievement-service";
import { getFriendsData } from "@/lib/friends-service";
import { ProfileContent } from "@/components/profile/profile-content";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  const data = await getDashboardData(clerkUser.id);
  const achievements = await getShowcasedAchievements(clerkUser.id);
  const friendsData = await getFriendsData(clerkUser.id);
  const profile = data?.profile;

  return (
    <ProfileContent
      targetClerkId={clerkUser.id}
      isOwner
      username={profile?.username}
      avatarUrl={clerkUser.imageUrl}
      bannerUrl={profile?.bannerUrl}
      memberSince={clerkUser.createdAt}
      profile={profile}
      achievements={achievements}
      friendsCount={friendsData.friends.length}
    />
  );
}