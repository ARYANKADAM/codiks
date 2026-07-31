import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { connectDB } from "@/lib/db";
import { Question } from "@/models/Question";
import { questionSchema } from "@/lib/validations/question-schema";

export async function GET(req, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  await connectDB();
  const q = await Question.findById(id).lean();
  if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    question: {
      id: String(q._id),
      type: q.type,
      title: q.title,
      prompt: q.prompt,
      difficulty: q.difficulty,
      points: q.points,
      tags: (q.tags ?? []).join(", "),
      options: q.options ?? [],
      functionName: q.functionName ?? "",
      constraints: q.constraints ?? "",
      starterCodeJs: q.starterCode?.javascript ?? q.starterCode?.get?.("javascript") ?? "",
      starterCodePython: q.starterCode?.python ?? q.starterCode?.get?.("python") ?? "",
      testCases: q.testCases ?? [],
    },
  });
}

export async function PATCH(req, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  const body = await req.json();
  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const data = parsed.data;
  const tags = data.tags ? data.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];

  await connectDB();

  const update =
    data.type === "mcq"
      ? {
          type: "mcq",
          title: data.title,
          prompt: data.prompt,
          difficulty: data.difficulty,
          points: data.points,
          tags,
          options: data.options,
          $unset: { testCases: "", starterCode: "", functionName: "", constraints: "" },
        }
      : {
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
          $unset: { options: "" },
        };

  await Question.findByIdAndUpdate(id, update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  await connectDB();
  await Question.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}