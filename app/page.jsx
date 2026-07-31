import Link from "next/link";
import { Swords, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { siteConfig } from "@/config/site";

const highlights = [
  {
    icon: Swords,
    title: "Live 1v1 battles",
    description: "Duel another developer in real time on the same problem, same clock.",
  },
  {
    icon: Trophy,
    title: "Ranked leaderboards",
    description: "Climb an ELO-based ladder that updates the moment a match ends.",
  },
  {
    icon: Zap,
    title: "Instant matchmaking",
    description: "Get paired by skill tier in seconds — no lobbies to babysit.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-grid">
      <header className="glass-panel sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-bold text-gradient-brand">{siteConfig.name}</span>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button variant="brand" asChild>
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-4">
        <section className="flex flex-col items-center gap-6 py-24 text-center">
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Code battles,{" "}
            <span className="text-gradient-brand">decided in real time.</span>
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {siteConfig.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" variant="brand" asChild>
              <Link href="/sign-up">Start a duel — it&apos;s free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sign-in">I already have an account</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-6 pb-24 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-gradient-brand">
                  <Icon className="size-5 text-primary-foreground" />
                </div>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
}
