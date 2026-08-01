import { auth } from "@clerk/nextjs/server";
import { getDailyChallenges } from "@/lib/daily-challenge-service";
import { msUntilNextUTCMidnight } from "@/lib/date-utils";
import { ChallengesPageClient } from "@/components/challenges/challenges-page-client";

export const metadata = { title: "Daily Challenges" };

export default async function ChallengesPage() {
  const { userId } = await auth();
  const data = await getDailyChallenges(userId);

  return <ChallengesPageClient initialData={{ ...data, resetsInMs: msUntilNextUTCMidnight() }} />;
}