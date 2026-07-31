import { requireAdmin } from "@/lib/require-admin";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Question } from "@/models/Question";

const QUESTIONS = [
  {
    title: "Binary search complexity",
    prompt: "What is the time complexity of binary search on a sorted array of n elements?",
    options: [
      { text: "O(n)", isCorrect: false },
      { text: "O(log n)", isCorrect: true },
      { text: "O(n log n)", isCorrect: false },
      { text: "O(1)", isCorrect: false },
    ],
  },
  {
    title: "Bubble sort worst case",
    prompt: "What is the worst-case time complexity of bubble sort?",
    options: [
      { text: "O(n)", isCorrect: false },
      { text: "O(n log n)", isCorrect: false },
      { text: "O(n²)", isCorrect: true },
      { text: "O(2ⁿ)", isCorrect: false },
    ],
  },
  {
    title: "Hash map lookup",
    prompt: "What is the average-case time complexity of a hash map lookup?",
    options: [
      { text: "O(1)", isCorrect: true },
      { text: "O(log n)", isCorrect: false },
      { text: "O(n)", isCorrect: false },
      { text: "O(n²)", isCorrect: false },
    ],
  },
  {
    title: "Space complexity of merge sort",
    prompt: "What is the space complexity of merge sort?",
    options: [
      { text: "O(1)", isCorrect: false },
      { text: "O(log n)", isCorrect: false },
      { text: "O(n)", isCorrect: true },
      { text: "O(n²)", isCorrect: false },
    ],
  },
  {
    title: "LIFO structure",
    prompt: "Which data structure follows Last-In-First-Out order?",
    options: [
      { text: "Queue", isCorrect: false },
      { text: "Stack", isCorrect: true },
      { text: "Linked List", isCorrect: false },
      { text: "Heap", isCorrect: false },
    ],
  },
  {
    title: "Balanced BST height",
    prompt: "What is the height of a balanced binary search tree with n nodes?",
    options: [
      { text: "O(n)", isCorrect: false },
      { text: "O(log n)", isCorrect: true },
      { text: "O(√n)", isCorrect: false },
      { text: "O(1)", isCorrect: false },
    ],
  },
  {
    title: "HTTP status code",
    prompt: "Which HTTP status code indicates a resource was successfully created?",
    options: [
      { text: "200", isCorrect: false },
      { text: "201", isCorrect: true },
      { text: "301", isCorrect: false },
      { text: "204", isCorrect: false },
    ],
  },
  {
    title: "OOP: overriding vs overloading",
    prompt: "Which OOP concept allows a subclass to provide a specific implementation of a method already defined in its parent class?",
    options: [
      { text: "Overloading", isCorrect: false },
      { text: "Overriding", isCorrect: true },
      { text: "Encapsulation", isCorrect: false },
      { text: "Abstraction", isCorrect: false },
    ],
  },
  {
    title: "TCP vs UDP",
    prompt: "Which protocol guarantees ordered, reliable delivery of data?",
    options: [
      { text: "UDP", isCorrect: false },
      { text: "TCP", isCorrect: true },
      { text: "ICMP", isCorrect: false },
      { text: "ARP", isCorrect: false },
    ],
  },
  {
    title: "Recursion base requirement",
    prompt: "What must every correct recursive function have to avoid infinite recursion?",
    options: [
      { text: "A loop", isCorrect: false },
      { text: "A base case", isCorrect: true },
      { text: "A return type", isCorrect: false },
      { text: "A global variable", isCorrect: false },
    ],
  },
  {
    title: "Big-O of linear search",
    prompt: "What is the worst-case time complexity of linear search on an unsorted array?",
    options: [
      { text: "O(1)", isCorrect: false },
      { text: "O(log n)", isCorrect: false },
      { text: "O(n)", isCorrect: true },
      { text: "O(n²)", isCorrect: false },
    ],
  },
  {
    title: "SQL vs NoSQL",
    prompt: "Which type of database is generally better suited for flexible, schema-less document storage?",
    options: [
      { text: "Relational (SQL)", isCorrect: false },
      { text: "Document-based (NoSQL)", isCorrect: true },
      { text: "Both equally", isCorrect: false },
      { text: "Neither", isCorrect: false },
    ],
  },
  {
    title: "REST idempotency",
    prompt: "Which HTTP method is idempotent, meaning repeated identical requests have the same effect as a single request?",
    options: [
      { text: "POST", isCorrect: false },
      { text: "PUT", isCorrect: true },
      { text: "PATCH", isCorrect: false },
      { text: "None of these", isCorrect: false },
    ],
  },
  {
    title: "Quick sort average case",
    prompt: "What is the average-case time complexity of quicksort?",
    options: [
      { text: "O(n)", isCorrect: false },
      { text: "O(n log n)", isCorrect: true },
      { text: "O(n²)", isCorrect: false },
      { text: "O(log n)", isCorrect: false },
    ],
  },
  {
    title: "Deadlock condition",
    prompt: "Which of these is NOT one of the four necessary conditions for a deadlock?",
    options: [
      { text: "Mutual exclusion", isCorrect: false },
      { text: "Circular wait", isCorrect: false },
      { text: "Preemption", isCorrect: true },
      { text: "Hold and wait", isCorrect: false },
    ],
  },
];

export async function POST() {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  await connectDB();
  await Question.deleteMany({ type: "mcq", tags: "cs-fundamentals" });

  const docs = await Question.insertMany(
    QUESTIONS.map((q) => ({
      type: "mcq",
      title: q.title,
      prompt: q.prompt,
      difficulty: "medium",
      points: 100,
      tags: ["cs-fundamentals"],
      options: q.options,
      createdBy: admin.user._id,
      isPublished: true,
    }))
  );

  return NextResponse.json({ created: docs.length });
}