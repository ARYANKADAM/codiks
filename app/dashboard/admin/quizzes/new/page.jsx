import { connectDB } from "@/lib/db";
import { Question } from "@/models/Question";
import { QuizForm } from "@/components/admin/quiz-form";

export const metadata = { title: "New Quiz" };

export default async function NewQuizPage() {
  await connectDB();
  const questions = await Question.find({ type: "mcq" }).select("title").lean();

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">New quiz</h1>
      <QuizForm availableQuestions={questions.map((q) => ({ id: String(q._id), title: q.title }))} />
    </div>
  );
}