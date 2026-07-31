import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Question } from "@/models/Question";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { DeleteQuestionButton } from "@/components/admin/delete-question-button";

export const metadata = { title: "Question Bank" };

export default async function QuestionsListPage() {
  await connectDB();
  const questions = await Question.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Question Bank</h1>
        <Button asChild><Link href="/dashboard/admin/questions/new"><Plus /> New question</Link></Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <CardContent className="p-0 divide-y divide-border">
          {questions.map((q) => (
            <div key={String(q._id)} className="flex items-center gap-3 px-4 py-3">
              <Badge variant="secondary">{q.type}</Badge>
              <span className="flex-1 truncate text-sm font-medium">{q.title}</span>
              <Badge variant="outline">{q.difficulty}</Badge>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/dashboard/admin/questions/${q._id}/edit`}>Edit</Link>
              </Button>
              <DeleteQuestionButton id={String(q._id)} />
            </div>
          ))}
          {questions.length === 0 && <p className="p-6 text-sm text-muted-foreground">No questions yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}