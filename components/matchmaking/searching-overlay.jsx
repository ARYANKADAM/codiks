"use client";

import { motion } from "framer-motion";
import { Swords, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogOverlay } from "@/components/shared/dialog-overlay";

function formatElapsed(ms) {
  const totalSec = Math.floor(ms / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function SearchingOverlay({ isOpen, elapsedMs, onCancel }) {
  return (
    <DialogOverlay isOpen={isOpen} onClose={onCancel} labelledBy="searching-title">
      <motion.div
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="flex size-20 items-center justify-center rounded-full bg-gradient-brand"
      >
        <Swords className="size-9 text-primary-foreground" />
      </motion.div>

      <div className="text-center">
        <h2 id="searching-title" className="text-xl font-bold">Searching for an opponent…</h2>
        <p className="mt-1 font-mono text-3xl tabular-nums text-muted-foreground">{formatElapsed(elapsedMs)}</p>
      </div>

      <Button variant="outline" onClick={onCancel}>
        <X /> Cancel search
      </Button>
    </DialogOverlay>
  );
}
export default SearchingOverlay;