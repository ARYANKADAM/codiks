import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { connectDB } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { quizSchema } from "@/lib/validations/quiz-schema";

export async function GET(req, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  await connectDB();
  const quiz = await Quiz.findById(id).lean();
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    quiz: {
      id: String(quiz._id),
      title: quiz.title,
      description: quiz.description ?? "",
      category: quiz.category ?? "",
      difficulty: quiz.difficulty,
      timePerQuestionSec: quiz.timePerQuestionSec,
      isPublished: quiz.isPublished,
      questionIds: quiz.questions.map(String),
    },
  });
}

export async function PATCH(req, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  const body = await req.json();
  const parsed = quizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  await connectDB();

  await Quiz.findByIdAndUpdate(id, {
    title: data.title,
    description: data.description,
    category: data.category,
    difficulty: data.difficulty,
    timePerQuestionSec: data.timePerQuestionSec,
    isPublished: data.isPublished,
    questions: data.questionIds,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  await connectDB();
  await Quiz.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}