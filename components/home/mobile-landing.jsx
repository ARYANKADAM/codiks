"use client";

import Link from "next/link";
import { ArrowRight, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { siteConfig } from "@/config/site";

export function MobileLanding() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">

      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      <div className="absolute -top-28 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

      <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-violet-500/10 blur-[90px]" />

      {/* Top */}

      <div className="relative z-10 flex items-center justify-end px-6 pt-8">
        <ThemeToggle />
      </div>

      {/* Center */}

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">

        {/* Logo */}

        <div className="mb-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-brand shadow-2xl">

          <Swords className="h-10 w-10 text-white" />

        </div>

        <h1 className="font-display text-5xl uppercase tracking-wide text-gradient-brand">
          {siteConfig.name}
        </h1>

        <p className="mt-4 text-lg font-semibold text-foreground">
          Compete. Learn. Dominate.
        </p>

        <p className="mt-4 max-w-xs text-sm leading-7 text-muted-foreground">
          Real-time coding battles, CS quizzes and math duels with players
          around the world.
        </p>

        {/* Buttons */}

        <div className="mt-14 flex w-full flex-col gap-4">

          <Button
            size="lg"
            variant="brand"
            className="h-14 rounded-2xl text-base"
            asChild
          >
            <Link href="/sign-up">
              Enter Arena
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="h-14 rounded-2xl border-border text-base"
            asChild
          >
            <Link href="/sign-in">
              I already have an account
            </Link>
          </Button>

        </div>

      </div>

      {/* Bottom */}

      <div className="relative z-10 pb-10 text-center">

        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">

          Built for Competitive Programmers

        </p>

      </div>
    </div>
  );
}

export default MobileLanding;