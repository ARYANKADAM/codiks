"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // If the viewport grows past the desktop breakpoint while the mobile
  // drawer is open, close it — otherwise it'd stay stuck open behind the
  // now-visible desktop sidebar.
  useEffect(() => {
    if (isDesktop) setIsMobileOpen(false);
  }, [isDesktop]);

  const toggleCollapse = useCallback(() => setIsCollapsed((v) => !v), []);
  const toggleMobile = useCallback(() => setIsMobileOpen((v) => !v), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);

  return (
    <SidebarContext.Provider
      value={{ isCollapsed, toggleCollapse, isMobileOpen, toggleMobile, closeMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a <SidebarProvider>");
  }
  return ctx;
}

export default SidebarProvider;