import { auth } from "@clerk/nextjs/server";
import { getAllUsersDirectory } from "@/lib/friends-service";
import { PeopleDirectoryClient } from "@/components/people/people-directory-client";

export const metadata = { title: "All Players" };

export default async function PeoplePage() {
  const { userId } = await auth();
  const users = await getAllUsersDirectory(userId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">All Players</h1>
        <p className="text-sm text-muted-foreground">Everyone who has joined CodeArena — add friends or challenge whoever's online.</p>
      </div>
      <PeopleDirectoryClient users={users} />
    </div>
  );
}