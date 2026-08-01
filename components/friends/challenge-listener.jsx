"use client";

import { useUser } from "@clerk/nextjs";
import { useIncomingChallenge } from "@/hooks/use-incoming-challenge";
import { ChallengeInviteModal } from "@/components/friends/challenge-invite-modal";

export function ChallengeListener() {
  const { user } = useUser();
  const [challenge, setChallenge] = useIncomingChallenge(user?.id);

  return <ChallengeInviteModal challenge={challenge} onClear={() => setChallenge(null)} />;
}

export default ChallengeListener;