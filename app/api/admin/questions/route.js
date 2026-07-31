import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { connectDB } from "@/lib/db";
import { Question } from "@/models/Question";
import { questionSchema } from "@/lib/validations/question-schema";

export async function GET(req) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const type = req.nextUrl.searchParams.get("type");
  await connectDB();
  const filter = type ? { type } : {};
  const questions = await Question.find(filter).sort({ createdAt: -1 }).lean();

  return NextResponse.json({
    questions: questions.map((q) => ({
      id: String(q._id),
      type: q.type,
      title: q.title,
      difficulty: q.difficulty,
      points: q.points,
      tags: q.tags,
      isPublished: q.isPublished,
    })),
  });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const body = await req.json();
  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  await connectDB();

  const doc =
    data.type === "mcq"
      ? await Question.create({
          type: "mcq",
          title: data.title,
          prompt: data.prompt,
          difficulty: data.difficulty,
          points: data.points,
          tags,
          options: data.options,
          createdBy: admin.user._id,
          isPublished: true,
        })
      : await Question.create({
          type: "coding",
          title: data.title,
          prompt: data.prompt,
          difficulty: data.difficulty,
          points: data.points,
          tags,
          functionName: data.functionName,
          constraints: data.constraints,
          starterCode: { javascript: data.starterCodeJs ?? "", python: data.starterCodePython ?? "" },
          testCases: data.testCases,
          createdBy: admin.user._id,
          isPublished: true,
        });

  return NextResponse.json({ id: String(doc._id) });
}