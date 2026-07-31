import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Question } from "@/models/Question";
import { QuestionForm } from "@/components/admin/question-form";

export const metadata = { title: "Edit Question" };

export default async function EditQuestionPage({ params }) {
  const { id } = await params;
  await connectDB();
  const q = await Question.findById(id).lean();
  if (!q) notFound();

  const initialData =
    q.type === "mcq"
      ? {
          type: "mcq",
          title: q.title,
          prompt: q.prompt,
          difficulty: q.difficulty,
          points: q.points,
          tags: (q.tags ?? []).join(", "),
          options: q.options,
        }
      : {
          type: "coding",
          title: q.title,
          prompt: q.prompt,
          difficulty: q.difficulty,
          points: q.points,
          tags: (q.tags ?? []).join(", "),
          functionName: q.functionName ?? "",
          constraints: q.constraints ?? "",
          starterCodeJs: q.starterCode?.get?.("javascript") ?? q.starterCode?.javascript ?? "",
          starterCodePython: q.starterCode?.get?.("python") ?? q.starterCode?.python ?? "",
          testCases: q.testCases ?? [],
        };

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Edit question</h1>
      <QuestionForm questionId={id} initialData={initialData} />
    </div>
  );
}