import { Swords, Trophy, Star, Shield, Flame, Award } from "lucide-react";

const ICONS = { swords: Swords, trophy: Trophy, star: Star, shield: Shield, flame: Flame, award: Award };

export function AchievementIcon({ icon, className }) {
  const Icon = ICONS[icon] ?? Trophy;
  return <Icon className={className} />;
}

export default AchievementIcon;