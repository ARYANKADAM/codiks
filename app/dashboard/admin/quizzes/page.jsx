import Link from "next/link";
import { connectDB } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export const metadata = { title: "Quiz Builder" };

export default async function QuizzesListPage() {
  await connectDB();
  const quizzes = await Quiz.find({}).sort({ createdAt: -1 }).lean();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <Button asChild><Link href="/dashboard/admin/quizzes/new"><Plus /> New quiz</Link></Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <CardContent className="p-0 divide-y divide-border">
          {quizzes.map((q) => (
            <div key={String(q._id)} className="flex items-center gap-3 px-4 py-3">
              <span className="flex-1 truncate text-sm font-medium">{q.title}</span>
              <span className="text-xs text-muted-foreground">{q.questions.length} questions</span>
              <Badge variant={q.isPublished ? "success" : "secondary"}>{q.isPublished ? "Published" : "Draft"}</Badge>
              <Button size="sm" variant="ghost" asChild>
                <Link href={`/dashboard/admin/quizzes/${q._id}/edit`}>Edit</Link>
              </Button>
            </div>
          ))}
          {quizzes.length === 0 && <p className="p-6 text-sm text-muted-foreground">No quizzes yet.</p>}
        </CardContent>
      </Card>
    </div>
  );
}