import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DuelModeCard({ tag, title, description, onClick, disabled, accent = "primary" }) {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      className={cn(
        "group overflow-hidden transition-all",
        disabled ? "opacity-60" : "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg"
      )}
    >
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <Badge variant={accent === "primary" ? "default" : "secondary"} className="mb-2">
            {tag}
          </Badge>
          <h3 className="font-display text-2xl uppercase leading-tight">{title}</h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {description}
          </p>
        </div>
        {!disabled && (
          <ChevronRight className="size-6 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
        )}
      </CardContent>
    </Card>
  );
}

export default DuelModeCard;