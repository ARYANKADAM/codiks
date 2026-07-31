"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AchievementBadge } from "@/components/achievements/achievement-badge";

const MAX_SHOWCASED = 8;
const TABS = [
  { key: "streak", label: "Streak" },
  { key: "victory", label: "Victories" },
];

export function AchievementsPageClient({ initialAchievements }) {
  const router = useRouter();
  const [tab, setTab] = useState("streak");
  const [selected, setSelected] = useState(() => new Set(initialAchievements.filter((a) => a.showcased).map((a) => a.id)));
  const [isSaving, setIsSaving] = useState(false);

  const visible = useMemo(() => initialAchievements.filter((a) => a.category === tab), [initialAchievements, tab]);

  function toggle(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size >= MAX_SHOWCASED) {
          toast.error(`You can only showcase up to ${MAX_SHOWCASED} badges.`);
          return prev;
        }
        next.add(id);
      }
      return next;
    });
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch("/api/achievements/showcase", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ achievementIds: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Showcase updated");
      router.push("/dashboard/profile");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Back">
            <ArrowLeft className="size-4" />
          </Button>
          <h1 className="text-2xl font-bold">Achievements</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving…" : `Save showcase (${selected.size}/${MAX_SHOWCASED})`}
        </Button>
      </div>

      <div className="flex gap-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
              tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Tap an unlocked badge to pin it to your profile (up to {MAX_SHOWCASED}).
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {visible.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            isSelected={selected.has(achievement.id)}
            onToggle={() => toggle(achievement.id)}
            selectionDisabled={selected.size >= MAX_SHOWCASED}
          />
        ))}
      </div>
    </div>
  );
}

export default AchievementsPageClient;