import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/dashboard-service";
import { getTierForRating } from "@/lib/tier";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const profile = await getUserProfile(user.id);
  const rating = profile?.rating ?? 1200;

  const currentUserData = {
     clerkId: user.id,
     role: profile?.role ?? "user",
    fullName: user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : user.username,
    email: user.primaryEmailAddress?.emailAddress,
    avatarUrl: user.imageUrl,
    rating,
    tier: getTierForRating(rating).label,
  };

  return (
    <SidebarProvider>
      <DashboardShell user={currentUserData}>{children}</DashboardShell>
    </SidebarProvider>
  );
}