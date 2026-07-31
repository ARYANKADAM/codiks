import "server-only";
import { auth } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) return { ok: false, status: 401, error: "Unauthorized" };

  await connectDB();
  const user = await User.findOne({ clerkId: userId });
  if (!user || user.role !== "admin") {
    return { ok: false, status: 403, error: "Admin access required" };
  }
  return { ok: true, user };
}

export default requireAdmin;