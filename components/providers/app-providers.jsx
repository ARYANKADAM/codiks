"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";

/**
 * Every app-wide provider lives here, composed in one place, so
 * app/layout.jsx stays a thin server component and we never end up
 * with providers scattered across multiple files.
 */
export function AppProviders({ children }) {
  return (
    <ClerkProvider
      signInUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
      signUpUrl={process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "oklch(0.58 0.21 265)",
        },
      }}
    >
      <ThemeProvider>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default AppProviders;