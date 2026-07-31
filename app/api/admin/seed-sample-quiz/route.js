import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Question } from "@/models/Question";
import { Quiz } from "@/models/Quiz";

const MCQ_QUESTIONS = [
  {
    title: "Time complexity of binary search",
    prompt: "What is the time complexity of binary search on a sorted array of n elements?",
    options: [
      { text: "O(n)", isCorrect: false },
      { text: "O(log n)", isCorrect: true },
      { text: "O(n log n)", isCorrect: false },
      { text: "O(1)", isCorrect: false },
    ],
  },
  {
    title: "JavaScript array method",
    prompt: "Which array method creates a new array with all elements that pass a test?",
    options: [
      { text: ".map()", isCorrect: false },
      { text: ".reduce()", isCorrect: false },
      { text: ".filter()", isCorrect: true },
      { text: ".forEach()", isCorrect: false },
    ],
  },
  {
    title: "Data structure for LIFO",
    prompt: "Which data structure follows Last-In-First-Out order?",
    options: [
      { text: "Queue", isCorrect: false },
      { text: "Stack", isCorrect: true },
      { text: "Linked List", isCorrect: false },
      { text: "Heap", isCorrect: false },
    ],
  },
];

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const me = await User.findOne({ clerkId: userId });
  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  await Quiz.deleteMany({ createdBy: me._id });
  await Question.deleteMany({ type: "mcq", createdBy: me._id });

  const questionDocs = await Question.insertMany(
    MCQ_QUESTIONS.map((q) => ({
      type: "mcq",
      title: q.title,
      prompt: q.prompt,
      difficulty: "medium",
      points: 100,
      options: q.options,
      createdBy: me._id,
      isPublished: true,
    }))
  );

  const quiz = await Quiz.create({
    title: "CS Fundamentals Warmup",
    description: "A quick 3-question warmup on complexity, JS arrays, and data structures.",
    createdBy: me._id,
    category: "Computer Science",
    difficulty: "mixed",
    questions: questionDocs.map((q) => q._id),
    timePerQuestionSec: 20,
    isPublished: true,
  });

  return NextResponse.json({ quizId: String(quiz._id), questionCount: questionDocs.length });
}