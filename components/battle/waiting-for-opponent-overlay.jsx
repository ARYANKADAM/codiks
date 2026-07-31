"use client";
import { ConnectingLoader } from "@/components/shared/connecting-loader";
import { DialogOverlay } from "@/components/shared/dialog-overlay";

export function WaitingForOpponentOverlay({ isOpen }) {
  return (
    <DialogOverlay isOpen={isOpen} closeOnEscape={false} labelledBy="connecting-title">
      <h2 id="connecting-title" className="sr-only">Connecting to opponent</h2>
      <ConnectingLoader label="Connecting you to your opponent…" size={20} />
    </DialogOverlay>
  );
}
export default WaitingForOpponentOverlay;