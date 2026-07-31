"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const OPTION_COLORS = [
  "border-destructive/40 hover:bg-destructive/10",
  "border-primary/40 hover:bg-primary/10",
  "border-success/40 hover:bg-success/10",
  "border-warning/40 hover:bg-warning/10",
];

export function CsQuizQuestionCard({ question, questionIndex, onAnswer }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
  }, [questionIndex]);

  async function handleSelect(optionIndex) {
    if (selected != null) return;
    setSelected(optionIndex);
    const isCorrect = await onAnswer(questionIndex, optionIndex);
    setFeedback(isCorrect ? "correct" : "wrong");
  }

  if (!question) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <AnimatePresence mode="wait">
          <motion.p
            key={questionIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="text-lg font-semibold"
          >
            {question.title}
          </motion.p>
        </AnimatePresence>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{question.prompt}</p>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected != null}
                className={cn(
                  "flex items-center justify-between rounded-lg border-2 p-3 text-left text-sm font-medium transition-all disabled:cursor-not-allowed",
                  OPTION_COLORS[i % OPTION_COLORS.length],
                  isSelected && feedback === "correct" && "border-success bg-success/15",
                  isSelected && feedback === "wrong" && "border-destructive bg-destructive/15"
                )}
              >
                {option.text}
                {isSelected && feedback === "correct" && <CheckCircle2 className="size-4 text-success" />}
                {isSelected && feedback === "wrong" && <XCircle className="size-4 text-destructive" />}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export default CsQuizQuestionCard;