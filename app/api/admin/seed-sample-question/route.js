import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { Question } from "@/models/Question";

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const me = await User.findOne({ clerkId: userId });
  if (!me) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  // Wipe and reseed so existing rooms pick up the new structured format.
  await Question.deleteMany({ type: "coding" });

  const question = await Question.create({
    type: "coding",
    title: "Two Sum",
    prompt:
      "Given an array of integers nums and an integer target, return the indices of the two numbers that add up to target.\n\nAssume exactly one valid answer exists, and you may not use the same element twice.",
    difficulty: "easy",
    tags: ["array", "hash-map"],
    points: 100,
    functionName: "twoSum",
    starterCode: {
      javascript: "function twoSum(nums, target) {\n  // your code here\n}",
      python: "def twoSum(nums, target):\n    # your code here\n    pass",
    },
    testCases: [
      { input: "[[2,7,11,15],9]", expectedOutput: "[0,1]", isHidden: false },
      { input: "[[3,2,4],6]", expectedOutput: "[1,2]", isHidden: false },
      { input: "[[3,3],6]", expectedOutput: "[0,1]", isHidden: true },
    ],
    constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9",
    timeLimitMs: 2000,
    createdBy: me._id,
    isPublished: true,
  });

  return NextResponse.json({ created: String(question._id) });
}