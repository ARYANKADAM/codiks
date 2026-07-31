"use client";

import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { LineChart as LineChartIcon } from "lucide-react";
import { TIER_LIST, getTierForRating } from "@/lib/tier";

export function RankHistoryFull({ data, currentRating }) {
  const hasEnoughData = data.length >= 2;
  const currentTier = getTierForRating(currentRating);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rank history</CardTitle>
        <CardDescription>Your full rating journey across every battle.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasEnoughData ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="rankFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={currentTier.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={currentTier.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="recordedAt"
                tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={45}
                domain={["dataMin - 50", "dataMax + 50"]}
              />
              {TIER_LIST.filter((t) => t.min > 0).map((t) => (
                <ReferenceLine
                  key={t.key}
                  y={t.min}
                  stroke={t.color}
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                  label={{ value: t.label, position: "insideTopRight", fill: t.color, fontSize: 10 }}
                />
              ))}
              <Tooltip
                contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="rating" stroke={currentTier.color} strokeWidth={2} fill="url(#rankFill)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon={LineChartIcon} title="Not enough data yet" description="Play a few more ranked battles to see your rank trend." />
        )}
      </CardContent>
    </Card>
  );
}

export default RankHistoryFull;