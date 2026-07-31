import { connectDB } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { QuizBrowseClient } from "@/components/quiz/quiz-browse-client";

export const metadata = { title: "Quizzes" };

export default async function QuizzesPage() {
  await connectDB();
  const quizzes = await Quiz.find({ isPublished: true }).select("title description category difficulty questions").lean();

  const serialized = quizzes.map((q) => ({
    id: String(q._id),
    title: q.title,
    description: q.description,
    category: q.category,
    difficulty: q.difficulty,
    questionCount: q.questions.length,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-sm text-muted-foreground">Host a live quiz round or join one with a code.</p>
      </div>
      <QuizBrowseClient quizzes={serialized} />
    </div>
  );
}