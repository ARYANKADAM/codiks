import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getDiscoverUsers } from "@/lib/friends-service";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await getDiscoverUsers(userId);
  return NextResponse.json({ users });
}