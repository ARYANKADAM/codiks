"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getMathQuestion } from "@/lib/math-question-generator";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MAX_DIGITS = 4;
const VERIFY_DELAY_MS = 450;
const NUMPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "clear"];

export function MathQuestionCard({ battleId, questionIndex, onAnswer }) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const [isChecking, setIsChecking] = useState(false);
  const verifyTimer = useRef(null);
  const question = getMathQuestion(battleId, questionIndex);

  // Only fires when the question actually changes — which now only
  // happens once this question has been answered correctly.
  useEffect(() => {
    clearTimeout(verifyTimer.current);
    setValue("");
    setFeedback(null);
    setIsChecking(false);
  }, [questionIndex]);

  // Auto-verify a short moment after the user stops typing — debounced so
  // a partial number mid-entry (e.g. "7" while typing "76") never briefly
  // flashes as wrong before the rest of the digits land.
  useEffect(() => {
    clearTimeout(verifyTimer.current);
    if (!value) {
      setFeedback(null);
      return;
    }

    verifyTimer.current = setTimeout(async () => {
      setIsChecking(true);
      const isCorrect = await onAnswer(questionIndex, Number(value));
      setIsChecking(false);

      if (isCorrect) {
        setFeedback("correct");
        // No manual reset needed — a correct answer advances questionIndex,
        // which triggers the cleanup effect above.
      } else {
        setFeedback("wrong");
      }
    }, VERIFY_DELAY_MS);

    return () => clearTimeout(verifyTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, questionIndex]);

  function appendDigit(digit) {
    if (value.length >= MAX_DIGITS) return;
    setFeedback(null);
    setValue((v) => v + digit);
  }

  function backspace() {
    setFeedback(null);
    setValue((v) => v.slice(0, -1));
  }

  function clearValue() {
    clearTimeout(verifyTimer.current);
    setFeedback(null);
    setValue("");
  }

  // Desktop: physical keyboard drives the same input state.
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key >= "0" && e.key <= "9") {
        appendDigit(e.key);
      } else if (e.key === "Backspace") {
        backspace();
      } else if (e.key === "Escape") {
        clearValue();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-center gap-6 p-6 sm:p-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={questionIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="font-display text-4xl tabular-nums sm:text-5xl"
          >
            {question.expression}
          </motion.p>
        </AnimatePresence>

        <motion.div
          animate={feedback === "wrong" ? { x: [0, -8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.4 }}
          className={cn(
            "flex h-16 w-full max-w-xs items-center justify-center rounded-xl border-2 text-3xl font-bold tabular-nums transition-colors",
            feedback === "correct" && "border-success bg-success/15 text-success",
            feedback === "wrong" && "border-destructive bg-destructive/15 text-destructive",
            !feedback && "border-border bg-secondary/40",
            isChecking && "opacity-70"
          )}
        >
          {value || <span className="text-muted-foreground">?</span>}
        </motion.div>

        {/* On-screen numpad — mobile only; desktop uses the physical keyboard */}
        <div className="grid w-full max-w-xs grid-cols-3 gap-2 sm:hidden">
          {NUMPAD_KEYS.map((key) => {
            if (key === "del") {
              return (
                <button
                  key={key}
                  onClick={backspace}
                  className="flex h-14 items-center justify-center rounded-lg border border-border bg-secondary/40 text-lg font-bold active:bg-secondary"
                  aria-label="Backspace"
                >
                  ⌫
                </button>
              );
            }
            if (key === "clear") {
              return (
                <button
                  key={key}
                  onClick={clearValue}
                  className="flex h-14 items-center justify-center gap-1 rounded-lg border border-destructive/40 bg-destructive/10 text-sm font-bold text-destructive active:bg-destructive/20"
                  aria-label="Clear answer"
                >
                  <X className="size-4" /> Clear
                </button>
              );
            }
            return (
              <button
                key={key}
                onClick={() => appendDigit(key)}
                className="flex h-14 items-center justify-center rounded-lg border border-border bg-secondary/40 text-xl font-bold active:bg-secondary"
              >
                {key}
              </button>
            );
          })}
        </div>

        <p className="hidden text-xs text-muted-foreground sm:block">
          Type your answer — it checks automatically. Press Esc to clear.
        </p>
      </CardContent>
    </Card>
  );
}

export default MathQuestionCard;