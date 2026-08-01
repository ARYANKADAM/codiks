import { LayoutDashboard, Target, Swords, ListChecks, Trophy, Bell, Settings } from "lucide-react";

export const navItems = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Challenges", href: "/dashboard/challenges", icon: Target },
  { title: "Battles", href: "/dashboard/battles", icon: Swords },
  { title: "Quizzes", href: "/dashboard/quizzes", icon: ListChecks },
  { title: "Leaderboard", href: "/dashboard/leaderboard", icon: Trophy },
  { title: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];