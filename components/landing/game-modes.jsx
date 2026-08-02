"use client";

import {
  BrainCircuit,
  Sigma,
  Swords,
} from "lucide-react";

import GameModeCard from "./game-mode-card";

export default function GameModes() {
  return (
    <section
      id="modes"
      className="mx-auto max-w-7xl px-4 py-32"
    >

      <div className="mb-20 text-center">

        <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
          Choose Your Battle
        </span>

        <h2 className="mt-6 font-display text-5xl uppercase">

          Every Match
          <br />
          Matters.

        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Compete across multiple game modes,
          improve your skills,
          and climb the rankings.
        </p>

      </div>

      <div className="grid gap-8 lg:grid-cols-2">

        <GameModeCard
          title="CS Quiz"
          icon={BrainCircuit}
          stats="12,540 Battles"
          description="Race against developers in operating systems, DBMS, networking, OOP, DSA and more."
          gradient="bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-transparent"
        />

        <GameModeCard
          title="Math Arena"
          icon={Sigma}
          stats="8,230 Players"
          description="Compete in fast-paced arithmetic, logic and aptitude challenges with live rankings."
          gradient="bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-transparent"
        />

        <div className="lg:col-span-2">

          <GameModeCard
            large
            title="Coding Battles"
            icon={Swords}
            stats="Ranked Matchmaking"
            description="Challenge developers in real-time coding battles, gain ELO, unlock achievements and dominate the leaderboard."
            gradient="bg-gradient-to-br from-pink-500/20 via-violet-500/15 to-transparent"
          />

        </div>

      </div>

    </section>
  );
}