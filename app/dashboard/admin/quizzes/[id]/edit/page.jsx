import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { Question } from "@/models/Question";
import { QuizForm } from "@/components/admin/quiz-form";

export const metadata = { title: "Edit Quiz" };

export default async function EditQuizPage({ params }) {
  const { id } = await params;
  await connectDB();

  const [quiz, questions] = await Promise.all([
    Quiz.findById(id).lean(),
    Question.find({ type: "mcq" }).select("title").lean(),
  ]);
  if (!quiz) notFound();

  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="text-2xl font-bold">Edit quiz</h1>
      <QuizForm
        quizId={id}
        initialData={{
          title: quiz.title,
          description: quiz.description ?? "",
          category: quiz.category ?? "",
          difficulty: quiz.difficulty,
          timePerQuestionSec: quiz.timePerQuestionSec,
          isPublished: quiz.isPublished,
          questionIds: quiz.questions.map(String),
        }}
        availableQuestions={questions.map((q) => ({ id: String(q._id), title: q.title }))}
      />
    </div>
  );
}