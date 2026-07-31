"use client";

import { useMemo, useState } from "react";
import { Play, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const LANGUAGE_LABELS = { javascript: "JavaScript", python: "Python" };

export function CodeEditor({ starterCode = {}, onRun, onSubmit, isRunning, isSubmitting }) {
  const availableLanguages = useMemo(
    () => (Object.keys(starterCode).length ? Object.keys(starterCode) : ["javascript"]),
    [starterCode]
  );
  const [language, setLanguage] = useState(availableLanguages[0]);
  const [code, setCode] = useState(starterCode[availableLanguages[0]] ?? "");

  function handleLanguageChange(nextLanguage) {
    setLanguage(nextLanguage);
    setCode(starterCode[nextLanguage] ?? "");
  }

  function handleKeyDown(e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const { selectionStart, selectionEnd } = e.target;
      const next = code.slice(0, selectionStart) + "  " + code.slice(selectionEnd);
      setCode(next);
      requestAnimationFrame(() => {
        e.target.selectionStart = e.target.selectionEnd = selectionStart + 2;
      });
    }
  }

  const lineCount = code.split("\n").length;
  const busy = isRunning || isSubmitting;

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border py-3">
        <div className="flex gap-1">
          {availableLanguages.map((lang) => (
            <Button
              key={lang}
              size="sm"
              variant={lang === language ? "secondary" : "ghost"}
              onClick={() => handleLanguageChange(lang)}
              disabled={busy}
            >
              {LANGUAGE_LABELS[lang] ?? lang}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onRun?.({ language, code })} disabled={busy}>
            {isRunning ? <Loader2 className="animate-spin" /> : <Play />}
            Run
          </Button>
          <Button size="sm" onClick={() => onSubmit?.({ language, code })} disabled={busy}>
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
            Submit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="flex h-full">
          <div
            aria-hidden="true"
            className="select-none border-r border-border bg-secondary/30 px-3 py-4 text-right font-mono text-xs leading-6 text-muted-foreground"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="h-full flex-1 resize-none bg-transparent px-3 py-4 font-mono text-xs leading-6 text-foreground outline-none"
            aria-label="Code editor"
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default CodeEditor;