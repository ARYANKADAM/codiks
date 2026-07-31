"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardError({ error, reset }) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-12 text-center">
      <AlertTriangle className="size-8 text-destructive" />
      <h2 className="font-semibold">Couldn&apos;t load this page</h2>
      <p className="max-w-sm text-sm text-muted-foreground">{error?.message || "An unexpected error occurred."}</p>
      <Button variant="outline" onClick={() => reset()}>
        <RotateCcw className="size-4" /> Retry
      </Button>
    </div>
  );
}