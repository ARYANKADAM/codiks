"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteQuestionButton({ id }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this question permanently?")) return;
    const res = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete");
      return;
    }
    toast.success("Question deleted");
    router.refresh();
  }

  return (
    <Button size="icon" variant="ghost" onClick={handleDelete}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}

export default DeleteQuestionButton;