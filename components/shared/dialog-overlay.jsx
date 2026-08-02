"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function DialogOverlay({ isOpen, onClose, closeOnEscape = true, closeOnOutsideClick = false, labelledBy, children, className = "" }) {
  const containerRef = useRef(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;
    containerRef.current?.focus();
    function handleKeyDown(e) {
      if (closeOnEscape && e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReduced ? undefined : { opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          ref={containerRef}
          tabIndex={-1}
          onClick={closeOnOutsideClick ? onClose : undefined}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-md outline-none ${className}`}
        >
          <div onClick={(e) => e.stopPropagation()} className="contents">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default DialogOverlay;