"use client";

import {
  BrainCircuit,
  Search,
  Swords,
  Trophy,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose Mode",
    description:
      "Select CS Quiz, Math Arena or Coding Battles and jump into the queue.",
    icon: BrainCircuit,
  },
  {
    number: "02",
    title: "Find Opponent",
    description:
      "Our matchmaking pairs you with players of similar skill in seconds.",
    icon: Search,
  },
  {
    number: "03",
    title: "Battle Live",
    description:
      "Solve questions faster than your opponent before the timer runs out.",
    icon: Swords,
  },
  {
    number: "04",
    title: "Climb",
    description:
      "Earn rating, unlock achievements and dominate the leaderboard.",
    icon: Trophy,
  },
];

export default function HowItWorks() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-4">

        <div className="text-center">

          <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
            How It Works
          </span>

          <h2 className="mt-6 font-display text-5xl uppercase">
            Enter.
            <br />
            Compete.
            <br />
            Win.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            From matchmaking to rating gains,
            every battle is designed to feel competitive.
          </p>

        </div>

        <div className="relative mt-24">

          <div className="absolute left-0 right-0 top-14 hidden h-px bg-border lg:block" />

          <div className="grid gap-8 lg:grid-cols-4">

            {steps.map((step, index) => (
              <div
                key={step.number}
                className="group relative rounded-3xl border border-border bg-card/70 p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-3 hover:border-primary/40 hover:shadow-[0_0_40px_rgba(120,90,255,.15)]"
              >

                <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground">
                  <step.icon className="size-7 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                </div>

                <span className="text-xs font-bold tracking-[0.3em] text-primary">
                  {step.number}
                </span>

                <h3 className="mt-3 text-2xl font-bold">
                  {step.title}
                </h3>

                <p className="mt-4 leading-7 text-muted-foreground">
                  {step.description}
                </p>

                {index !== steps.length - 1 && (
                  <ArrowRight className="absolute -right-4 top-14 hidden text-primary lg:block" />
                )}
              </div>
            ))}

          </div>

        </div>

      </div>
    </section>
  );
}