import { z } from "zod";

const optionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean(),
});

const testCaseSchema = z.object({
  input: z.string().min(1, "Input is required"),
  expectedOutput: z.string().min(1, "Expected output is required"),
  isHidden: z.boolean(),
});

const baseFields = {
  title: z.string().min(3, "Title must be at least 3 characters"),
  prompt: z.string().min(10, "Prompt must be at least 10 characters"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.coerce.number().int().min(10).max(1000),
  tags: z.string().optional(),
};

export const mcqQuestionSchema = z.object({
  ...baseFields,
  type: z.literal("mcq"),
  options: z
    .array(optionSchema)
    .min(2, "At least 2 options required")
    .refine((opts) => opts.filter((o) => o.isCorrect).length === 1, {
      message: "Exactly one option must be marked correct",
    }),
});

export const codingQuestionSchema = z.object({
  ...baseFields,
  type: z.literal("coding"),
  functionName: z.string().min(1, "Function name is required"),
  constraints: z.string().optional(),
  starterCodeJs: z.string().optional(),
  starterCodePython: z.string().optional(),
  testCases: z.array(testCaseSchema).min(1, "At least 1 test case required"),
});

export const questionSchema = z.discriminatedUnion("type", [mcqQuestionSchema, codingQuestionSchema]);
export default questionSchema;