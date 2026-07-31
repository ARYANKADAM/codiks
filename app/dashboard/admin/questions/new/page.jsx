import { QuestionForm } from "@/components/admin/question-form";

export const metadata = { title: "New Question" };

export default function NewQuestionPage() {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">New question</h1>
      <QuestionForm />
    </div>
  );
}