"use client";

import { motion } from "framer-motion";

export function QuestionCountdownLoader({ secondsLeft, showLabel = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", damping: 15 }}
      className="flex flex-col items-center justify-center gap-3 py-2"
    >
      <div className="quiz-cube-spinner-wrapper relative flex items-center justify-center">
        <div className="quiz-cube-spinner">
          <div />
          <div />
          <div />
          <div />
          <div />
          <div />
        </div>
        <span className="absolute text-xl font-bold tabular-nums text-foreground">{secondsLeft}</span>
      </div>
      {showLabel && <p className="text-sm text-muted-foreground">Next question in {secondsLeft}s…</p>}
    </motion.div>
  );
}

export default QuestionCountdownLoader;