"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import Image from "next/image";

const navItems = [
  {
    label: "Game Modes",
    href: "#modes",
  },
  {
    label: "Leaderboard",
    href: "#leaderboard",
  },
  {
    label: "Community",
    href: "#community",
  },
  {
    label: "About",
    href: "#about",
  },
];

export default function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto mt-4 max-w-7xl px-4">
        <div className="glass-panel flex h-16 items-center justify-between rounded-2xl px-2">

          {/* Logo */}

<Link
  href="/"
  className="flex items-center"
>
  <Image
    src="/logo.png"
    alt="Codiks Logo"
    width={270}
    height={100}
    priority
    className="h-24 w-auto"
  />
</Link>

          {/* Desktop */}

          {/* <nav className="hidden items-center gap-10 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold uppercase tracking-wider text-muted-foreground transition hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
          </nav> */}

          {/* Right */}

          <div className="hidden items-center gap-3 lg:flex">
            <ThemeToggle />

            <Button variant="ghost" asChild>
              <Link href="/sign-in">
                Login
              </Link>
            </Button>

            <Button
              variant="brand"
              className="px-6 uppercase tracking-wide"
              asChild
            >
              <Link href="/sign-up">
                Enter Arena
              </Link>
            </Button>
          </div>

          {/* Mobile */}

          <div className="flex items-center gap-2 lg:hidden">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(!open)}
            >
              <Menu />
            </Button>
          </div>
        </div>

        {open && (
          <div className="glass-panel mt-3 rounded-2xl p-5 lg:hidden">

            <div className="flex flex-col gap-5">

              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="font-semibold"
                >
                  {item.label}
                </Link>
              ))}

              <Button
                variant="outline"
                asChild
              >
                <Link href="/sign-in">
                  Login
                </Link>
              </Button>

              <Button
                variant="brand"
                asChild
              >
                <Link href="/sign-up">
                  Enter Arena
                </Link>
              </Button>

            </div>

          </div>
        )}
      </div>
    </header>
  );
}