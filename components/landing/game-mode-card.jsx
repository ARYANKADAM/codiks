"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function GameModeCard({
  title,
  description,
  icon: Icon,
  stats,
  gradient,
  large = false,
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-border/70 bg-card/60 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(120,90,255,0.18)]",
        large ? "min-h-[280px]" : "min-h-[240px]"
      )}
    >
      {/* Gradient */}

      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100",
          gradient
        )}
      />

      {/* Glow */}

      <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between p-8">

        <div>

          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-background/70">
            <Icon className="size-7 text-primary transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110" />
          </div>

          <h3 className="font-display text-3xl uppercase">
            {title}
          </h3>

          <p className="mt-4 max-w-sm leading-7 text-muted-foreground">
            {description}
          </p>

        </div>

        <div>

          <div className="mb-6 flex items-center justify-between text-sm">

            <span className="font-semibold text-primary">
              {stats}
            </span>

            <span className="text-muted-foreground">
              Live
            </span>

          </div>

          <Button
            variant="secondary"
            className="group/button w-full justify-between"
            asChild
          >
            <Link href="/sign-up">

              Play Now

              <ArrowRight className="transition-transform group-hover/button:translate-x-1" />

            </Link>
          </Button>

        </div>

      </div>

    </div>
  );
}