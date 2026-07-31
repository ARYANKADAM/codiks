"use client";

import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export function RatingChart({ data }) {
  const hasEnoughData = data.length >= 2;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rating history</CardTitle>
        <CardDescription>Your ELO over your last battles.</CardDescription>
      </CardHeader>
      <CardContent>
        {hasEnoughData ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="ratingFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
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
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(v) => new Date(v).toLocaleDateString()}
              />
              <Area type="monotone" dataKey="rating" stroke="var(--color-primary)" strokeWidth={2} fill="url(#ratingFill)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={LineChartIcon}
            title="Not enough data yet"
            description="Play a few ranked battles and your rating trend will appear here."
          />
        )}
      </CardContent>
    </Card>
  );
}

export default RatingChart;