"use client";

import {
  Circle,
  Trophy,
  Flame,
  Swords,
  ArrowRight,
} from "lucide-react";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const players = [
  {
    name: "Aryan",
    status: "Searching...",
  },
  {
    name: "Sophia",
    status: "In Match",
  },
  {
    name: "Rahul",
    status: "Won +25",
  },
  {
    name: "Alex",
    status: "Coding...",
  },
];

const leaderboard = [
  {
    name: "Alex",
    rating: 2345,
  },
  {
    name: "Aryan",
    rating: 2284,
  },
  {
    name: "Sophia",
    rating: 2242,
  },
];

export default function LiveArena() {
  return (
    <section
      id="community"
      className="relative pb"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-4">

        <div className="mb-20 text-center">

          <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            Live Arena
          </span>

          <h2 className="mt-6 font-display text-5xl uppercase">
            Join Thousands
            <br />
            Competing Right Now
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            Challenge developers across coding, CS quizzes and math battles in real time.
          </p>

        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* LIVE */}

          <div className="rounded-3xl border border-border bg-card/70 p-8 backdrop-blur-xl">

            <div className="mb-8 flex items-center gap-3">

              <Circle
                className="fill-green-500 text-green-500 animate-pulse"
                size={12}
              />

              <span className="font-semibold">
                2,431 Developers Online
              </span>

            </div>

            <div className="space-y-5">

              {players.map((player) => (

                <div
                  key={player.name}
                  className="flex items-center justify-between rounded-xl bg-secondary/40 p-4"
                >
                  <span>{player.name}</span>

                  <span className="text-sm text-muted-foreground">
                    {player.status}
                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* Leaderboard */}

          <div className="rounded-3xl border border-border bg-card/70 p-8 backdrop-blur-xl">

            <div className="mb-8 flex items-center gap-3">

              <Trophy className="text-yellow-500" />

              <span className="font-semibold">
                Top Players
              </span>

            </div>

            <div className="space-y-4">

              {leaderboard.map((player, index) => (

                <div
                  key={player.name}
                  className="flex items-center justify-between rounded-xl bg-secondary/40 p-4"
                >
                  <div className="flex gap-4">

                    <span className="font-bold">
                      #{index + 1}
                    </span>

                    <span>{player.name}</span>

                  </div>

                  <span className="font-semibold text-primary">
                    {player.rating}
                  </span>

                </div>

              ))}

            </div>

          </div>

          {/* Stats */}

          <div className="rounded-3xl border border-border bg-gradient-brand p-8 text-primary-foreground">

            <Flame size={36} />

            <h3 className="mt-8 text-3xl font-bold">
              Daily Activity
            </h3>

            <div className="mt-10 space-y-8">

              <div>

                <p className="text-4xl font-bold">
                  82K+
                </p>

                <p>Matches Today</p>

              </div>

              <div>

                <p className="text-4xl font-bold">
                  4.8M
                </p>

                <p>Problems Solved</p>

              </div>

            </div>

            <Button
              className="mt-12 w-full bg-white text-black hover:bg-white/90"
              asChild
            >
              <Link href="/sign-up">

                Enter Arena

                <ArrowRight />

              </Link>

            </Button>

          </div>

        </div>

      </div>
    </section>
  );
}