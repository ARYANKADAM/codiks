import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const VERDICT_LABEL = {
  accepted: "Accepted",
  wrong_answer: "Wrong Answer",
  runtime_error: "Runtime Error",
  compile_error: "Compile Error",
  time_limit_exceeded: "Time Limit Exceeded",
};

const VERDICT_VARIANT = {
  accepted: "success",
  wrong_answer: "destructive",
  runtime_error: "destructive",
  compile_error: "destructive",
  time_limit_exceeded: "destructive",
};

export function SubmissionResult({ outcome }) {
  if (!outcome) return null;

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">Result</CardTitle>
        <Badge variant={VERDICT_VARIANT[outcome.verdict] ?? "secondary"}>
          {VERDICT_LABEL[outcome.verdict] ?? outcome.verdict}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-2">
        {outcome.error && (
          <p className="whitespace-pre-wrap rounded-md bg-destructive/10 p-2 font-mono text-xs text-destructive">
            {outcome.error}
          </p>
        )}
        {outcome.results?.map((r, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md border border-border p-2 text-xs">
            {r.passed ? (
              <CheckCircle2 className="size-4 shrink-0 text-success" />
            ) : (
              <XCircle className="size-4 shrink-0 text-destructive" />
            )}
            <span>Test case {i + 1}</span>
            {!r.passed && r.error && <span className="truncate text-muted-foreground">— {r.error}</span>}
            {!r.passed && !r.error && (
              <span className="truncate text-muted-foreground">
                — expected {JSON.stringify(r.expected)}, got {JSON.stringify(r.actual)}
              </span>
            )}
            <span className="ml-auto shrink-0 text-muted-foreground">{r.timeMs}ms</span>
          </div>
        ))}
        {outcome.runtimeMs != null && (
          <p className="pt-1 text-xs text-muted-foreground">
            Runtime: {outcome.runtimeMs}ms
            {outcome.memoryKb != null && ` · Memory: ${outcome.memoryKb}KB`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default SubmissionResult;