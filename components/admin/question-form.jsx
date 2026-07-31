"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { questionSchema } from "@/lib/validations/question-schema";

const EMPTY_MCQ = {
  type: "mcq",
  title: "",
  prompt: "",
  difficulty: "medium",
  points: 100,
  tags: "",
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
  ],
};

const EMPTY_CODING = {
  type: "coding",
  title: "",
  prompt: "",
  difficulty: "medium",
  points: 100,
  tags: "",
  functionName: "",
  constraints: "",
  starterCodeJs: "",
  starterCodePython: "",
  testCases: [{ input: "", expectedOutput: "", isHidden: false }],
};

export function QuestionForm({ questionId, initialData }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData ?? EMPTY_MCQ,
  });

  const type = watch("type");
  const optionsArray = useFieldArray({ control, name: "options" });
  const testCasesArray = useFieldArray({ control, name: "testCases" });

  function switchType(nextType) {
    setValue("type", nextType);
    // Reset the fields specific to the other type so stale validation errors don't linger
    if (nextType === "mcq") {
      setValue("options", EMPTY_MCQ.options);
    } else {
      setValue("testCases", EMPTY_CODING.testCases);
    }
  }

  async function onSubmit(data) {
    setIsSubmitting(true);
    try {
      const url = questionId ? `/api/admin/questions/${questionId}` : "/api/admin/questions";
      const res = await fetch(url, {
        method: questionId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success(questionId ? "Question updated" : "Question created");
      router.push("/dashboard/admin/questions");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex gap-2">
        <Button type="button" variant={type === "mcq" ? "secondary" : "outline"} onClick={() => switchType("mcq")}>
          Multiple Choice
        </Button>
        <Button type="button" variant={type === "coding" ? "secondary" : "outline"} onClick={() => switchType("coding")}>
          Coding
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
<Input id="title" {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Prompt</Label>
            <Textarea {...register("prompt")} rows={4} placeholder="Full question text…" />
            {errors.prompt && <p className="mt-1 text-xs text-destructive">{errors.prompt.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Difficulty</Label>
              <select {...register("difficulty")} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <Label>Points</Label>
              <Input type="number" {...register("points")} />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input {...register("tags")} placeholder="array, hash-map" />
            </div>
          </div>
        </CardContent>
      </Card>

      {type === "mcq" ? (
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Options</CardTitle>
            <Button type="button" size="sm" variant="outline" onClick={() => optionsArray.append({ text: "", isCorrect: false })}>
              <Plus className="size-4" /> Add option
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {optionsArray.fields.map((field, i) => (
              <div key={field.id} className="flex items-center gap-2">
                <Controller
                  control={control}
                  name={`options.${i}.isCorrect`}
                  render={({ field: f }) => (
                    <input
                      type="radio"
                      name="correctOption"
                      checked={f.value}
                      onChange={() => {
                        optionsArray.fields.forEach((_, j) => setValue(`options.${j}.isCorrect`, j === i));
                      }}
                      className="size-4"
                      aria-label={`Mark option ${i + 1} correct`}
                    />
                  )}
                />
                <Input {...register(`options.${i}.text`)} placeholder={`Option ${i + 1}`} className="flex-1" />
                <Button type="button" variant="ghost" size="icon" onClick={() => optionsArray.remove(i)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {errors.options && <p className="text-xs text-destructive">{errors.options.message ?? errors.options.root?.message}</p>}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Solution setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Function name</Label>
                <Input {...register("functionName")} placeholder="e.g. twoSum" />
                {errors.functionName && <p className="mt-1 text-xs text-destructive">{errors.functionName.message}</p>}
              </div>
              <div>
                <Label>Constraints (optional)</Label>
                <Textarea {...register("constraints")} rows={2} />
              </div>
              <div>
                <Label>JavaScript starter code</Label>
                <Textarea {...register("starterCodeJs")} rows={3} className="font-mono text-xs" />
              </div>
              <div>
                <Label>Python starter code (optional)</Label>
                <Textarea {...register("starterCodePython")} rows={3} className="font-mono text-xs" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Test cases</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={() => testCasesArray.append({ input: "", expectedOutput: "", isHidden: false })}>
                <Plus className="size-4" /> Add test case
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {testCasesArray.fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-2">
                  <Input {...register(`testCases.${i}.input`)} placeholder='Input, e.g. [[2,7,11,15],9]' className="font-mono text-xs" />
                  <Input {...register(`testCases.${i}.expectedOutput`)} placeholder="Expected output, e.g. [0,1]" className="font-mono text-xs" />
                  <label className="flex items-center gap-1 text-xs text-muted-foreground">
                    <input type="checkbox" {...register(`testCases.${i}.isHidden`)} /> Hidden
                  </label>
                  <Button type="button" variant="ghost" size="icon" onClick={() => testCasesArray.remove(i)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              {errors.testCases && <p className="text-xs text-destructive">{errors.testCases.message ?? errors.testCases.root?.message}</p>}
            </CardContent>
          </Card>
        </>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : questionId ? "Save changes" : "Create question"}
      </Button>
    </form>
  );
}

export default QuestionForm;