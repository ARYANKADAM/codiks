"use client";

import Link from "next/link";
import { ArrowRight, Play, Trophy, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroPreview from "./hero-preview";

const stats = [
  { icon: Users, value: "12K+", label: "Developers" },
  { icon: Zap, value: "85K+", label: "Battles" },
  { icon: Trophy, value: "1200+", label: "Top Rating" },
];

export default function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 lg:pt-16">
      <div className="absolute left-1/3 top-16 h-80 w-80 -translate-x-1/2 rounded-full bg-glow-primary blur-[120px]" />
      <div className="absolute right-1/4 top-40 h-72 w-72 rounded-full bg-glow-accent blur-[120px]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 lg:grid-cols-2">
        <div>
          <span className="inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            ⚔ Real-time Competitive Coding
          </span>

          <h1 className="mt-6 font-display text-5xl leading-none md:text-6xl xl:text-7xl">
            COMPETE.
            <br />
            <span className="text-gradient-brand">LEARN.</span>
            <br />
            DOMINATE.
          </h1>

          <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground">
            Challenge developers from around the world in live coding battles, CS quizzes and math duels.
            Climb the leaderboard, unlock achievements and prove your skills.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button size="lg" variant="brand" className="h-12 px-8" asChild>
              <Link href="/sign-up">
                Enter Arena
                <ArrowRight className="ml-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8">
              <Play className="mr-2" />
              Watch Demo
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6">
            {stats.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center gap-2">
                  <item.icon className="size-5 text-primary" />
                  <span className="text-2xl font-bold">{item.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden items-center justify-center lg:flex">
          <HeroPreview />
        </div>
      </div>
    </section>
  );
}