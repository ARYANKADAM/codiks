import { CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MODE_LABEL = { math: "Math", cs_quiz: "CS Quiz", any: "Any Mode" };

export function ChallengeCard({ challenge }) {
  const percent = (challenge.current / challenge.target) * 100;

  return (
    <Card className={challenge.completed ? "border-success/40 bg-success/5" : undefined}>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{MODE_LABEL[challenge.mode]}</Badge>
          {challenge.completed && <CheckCircle2 className="size-5 text-success" />}
        </div>
        <div>
          <p className="font-semibold">{challenge.title}</p>
          <p className="text-xs text-muted-foreground">{challenge.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all ${challenge.completed ? "bg-success" : "bg-gradient-brand"}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {challenge.current}/{challenge.target}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default ChallengeCard;