"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quizSchema } from "@/lib/validations/quiz-schema";

export function QuizForm({ quizId, initialData, availableQuestions }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState(initialData?.questionIds ?? []);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(quizSchema),
    defaultValues: initialData ?? {
      title: "",
      description: "",
      category: "",
      difficulty: "mixed",
      timePerQuestionSec: 20,
      isPublished: true,
      questionIds: [],
    },
  });

  function toggleQuestion(id) {
    const next = selectedIds.includes(id) ? selectedIds.filter((qid) => qid !== id) : [...selectedIds, id];
    setSelectedIds(next);
    setValue("questionIds", next, { shouldValidate: true });
  }

  function move(index, direction) {
    const next = [...selectedIds];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSelectedIds(next);
    setValue("questionIds", next, { shouldValidate: true });
  }

  async function onSubmit(data) {
    setIsSubmitting(true);
    try {
      const url = quizId ? `/api/admin/quizzes/${quizId}` : "/api/admin/quizzes";
      const res = await fetch(url, {
        method: quizId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, questionIds: selectedIds }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error);
      toast.success(quizId ? "Quiz updated" : "Quiz created");
      router.push("/dashboard/admin/quizzes");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
<Input id="title" {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
          </div>
          <div>
            <Label>Description</Label>
            <Textarea {...register("description")} rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Category</Label>
              <Input {...register("category")} placeholder="e.g. Computer Science" />
            </div>
            <div>
              <Label>Difficulty</Label>
              <select {...register("difficulty")} className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <Label>Seconds per question</Label>
              <Input type="number" {...register("timePerQuestionSec")} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("isPublished")} /> Published (visible to players)
          </label>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Available questions</CardTitle></CardHeader>
          <CardContent className="max-h-96 space-y-2 overflow-y-auto">
            {availableQuestions.length === 0 && (
              <p className="text-sm text-muted-foreground">No MCQ questions yet — create some in the Question Bank first.</p>
            )}
            {availableQuestions.map((q) => (
              <label key={q.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2 text-sm hover:bg-secondary/50">
                <input type="checkbox" checked={selectedIds.includes(q.id)} onChange={() => toggleQuestion(q.id)} />
                {q.title}
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Selected order ({selectedIds.length})</CardTitle></CardHeader>
          <CardContent className="max-h-96 space-y-2 overflow-y-auto">
            {selectedIds.length === 0 && <p className="text-sm text-muted-foreground">No questions selected yet.</p>}
            {selectedIds.map((id, i) => {
              const q = availableQuestions.find((aq) => aq.id === id);
              return (
                <div key={id} className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm">
                  <span className="w-5 text-center text-xs text-muted-foreground">{i + 1}</span>
                  <span className="flex-1 truncate">{q?.title ?? "Unknown"}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => move(i, -1)}><ChevronUp className="size-4" /></Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => move(i, 1)}><ChevronDown className="size-4" /></Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => toggleQuestion(id)}><X className="size-4" /></Button>
                </div>
              );
            })}
            {errors.questionIds && <p className="text-xs text-destructive">{errors.questionIds.message}</p>}
          </CardContent>
        </Card>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : quizId ? "Save changes" : "Create quiz"}
      </Button>
    </form>
  );
}

export default QuizForm;