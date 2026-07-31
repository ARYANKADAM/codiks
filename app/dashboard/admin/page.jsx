import Link from "next/link";
import { ListChecks, FileQuestion } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = { title: "Admin" };

export default function AdminOverviewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/admin/questions">
          <Card className="h-full transition-shadow hover:shadow-lg">
            <CardHeader>
              <FileQuestion className="mb-2 size-6 text-primary" />
              <CardTitle>Question Bank</CardTitle>
              <CardDescription>Create and manage MCQ and coding questions.</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        </Link>
        <Link href="/dashboard/admin/quizzes">
          <Card className="h-full transition-shadow hover:shadow-lg">
            <CardHeader>
              <ListChecks className="mb-2 size-6 text-primary" />
              <CardTitle>Quiz Builder</CardTitle>
              <CardDescription>Assemble MCQ questions into playable quizzes.</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        </Link>
      </div>
    </div>
  );
}