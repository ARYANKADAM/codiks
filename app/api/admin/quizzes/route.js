import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { connectDB } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { quizSchema } from "@/lib/validations/quiz-schema";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  await connectDB();
  const quizzes = await Quiz.find({}).sort({ createdAt: -1 }).select("title category difficulty isPublished questions").lean();

  return NextResponse.json({
    quizzes: quizzes.map((q) => ({
      id: String(q._id),
      title: q.title,
      category: q.category,
      difficulty: q.difficulty,
      isPublished: q.isPublished,
      questionCount: q.questions.length,
    })),
  });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const parsed = quizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  await connectDB();

  const quiz = await Quiz.create({
    title: data.title,
    description: data.description,
    category: data.category,
    difficulty: data.difficulty,
    timePerQuestionSec: data.timePerQuestionSec,
    isPublished: data.isPublished,
    questions: data.questionIds,
    createdBy: admin.user._id,
  });

  return NextResponse.json({ id: String(quiz._id) });
}