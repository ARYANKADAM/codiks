import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export default async function AdminLayout({ children }) {
  const clerkUser = await currentUser();
  await connectDB();
  const me = await User.findOne({ clerkId: clerkUser.id }).select("role");

  if (!me || me.role !== "admin") redirect("/dashboard");

  return <div className="space-y-6">{children}</div>;
}