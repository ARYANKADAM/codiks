import { z } from "zod";

export const quizSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]),
  timePerQuestionSec: z.coerce.number().int().min(5).max(120),
  isPublished: z.boolean(),
  questionIds: z.array(z.string()).min(1, "Select at least one question"),
});

export default quizSchema;