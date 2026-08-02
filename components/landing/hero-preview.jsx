"use client";

import {
  Trophy,
  Users,
  Swords,
  BrainCircuit,
  ArrowUpRight,
} from "lucide-react";

export default function HeroPreview() {
  return (
    <div className="relative mx-auto h-[520px] w-full max-w-[560px]">

      {/* Glow */}

      <div className="absolute inset-0 rounded-full bg-primary/20 blur-[120px]" />

      {/* Main Dashboard */}

      <div
        className="
        absolute
        left-10
        top-10
        w-[360px]
        rounded-3xl
        border
        border-border/60
        bg-card/70
        p-6
        shadow-2xl
        backdrop-blur-xl
        "
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Matchmaking
            </p>

            <h3 className="mt-1 text-xl font-bold">
              Finding Opponent...
            </h3>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Swords className="text-primary" />
          </div>
        </div>

        <div className="mt-8 h-3 overflow-hidden rounded-full bg-secondary">
          <div className="h-full w-3/4 rounded-full bg-gradient-brand animate-pulse" />
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-2xl bg-secondary/60 p-4">
            <p className="text-xs text-muted-foreground">
              Rating
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              1264
            </h2>

            <div className="mt-3 flex items-center gap-2 text-success">
              <ArrowUpRight size={16} />
              +32
            </div>
          </div>

          <div className="rounded-2xl bg-secondary/60 p-4">
            <p className="text-xs text-muted-foreground">
              Win Rate
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              87%
            </h2>

            <p className="mt-3 text-xs text-success">
              Top 8%
            </p>
          </div>

        </div>
      </div>

      {/* Floating Card */}

      <div
        className="
        absolute
        right-2
        top-0
        w-44
        rounded-2xl
        border
        border-border
        bg-card
        p-5
        shadow-xl
        animate-[float_6s_ease-in-out_infinite]
        "
      >
        <BrainCircuit className="mb-3 text-primary" />

        <h4 className="font-semibold">
          CS Quiz
        </h4>

        <p className="mt-1 text-sm text-muted-foreground">
          Live Battle
        </p>
      </div>

      {/* Floating Card */}

      <div
        className="
        absolute
        bottom-12
        left-0
        w-48
        rounded-2xl
        border
        border-border
        bg-card
        p-5
        shadow-xl
        animate-[float_7s_ease-in-out_infinite]
        "
      >
        <Users className="mb-3 text-primary" />

        <h4 className="font-semibold">
          Friends Online
        </h4>

        <p className="mt-2 text-sm text-muted-foreground">
          12 Online
        </p>
      </div>

      {/* Floating Card */}

      <div
        className="
        absolute
        bottom-0
        right-8
        w-48
        rounded-2xl
        border
        border-border
        bg-card
        p-5
        shadow-xl
        animate-[float_5s_ease-in-out_infinite]
        "
      >
        <Trophy className="mb-3 text-warning" />

        <h4 className="font-semibold">
          Gold League
        </h4>

        <p className="mt-2 text-sm text-muted-foreground">
          Rank #184
        </p>
      </div>

    </div>
  );
}