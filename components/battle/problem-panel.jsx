import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const difficultyVariant = { easy: "success", medium: "outline", hard: "destructive" };

export function ProblemPanel({ question }) {
  if (!question) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
          No question assigned to this battle yet.
        </CardContent>
      </Card>
    );
  }

  const sampleCases = (question.testCases ?? []).filter((tc) => !tc.isHidden);

  return (
    <Card className="flex h-full flex-col overflow-hidden">
      <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border">
        <CardTitle className="text-base">{question.title}</CardTitle>
        <Badge variant={difficultyVariant[question.difficulty] ?? "secondary"}>{question.difficulty}</Badge>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-5 text-sm leading-relaxed">
        <p className="whitespace-pre-wrap text-foreground">{question.prompt}</p>

        {question.constraints && (
          <div className="mt-4">
            <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Constraints
            </h4>
            <p className="whitespace-pre-wrap text-muted-foreground">{question.constraints}</p>
          </div>
        )}

        {sampleCases.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sample cases
            </h4>
            {sampleCases.map((tc, i) => (
              <div key={i} className="rounded-lg border border-border bg-secondary/50 p-3 font-mono text-xs">
                <p>
                  <span className="text-muted-foreground">Input: </span>
                  {tc.input}
                </p>
                <p>
                  <span className="text-muted-foreground">Output: </span>
                  {tc.expectedOutput}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ProblemPanel;