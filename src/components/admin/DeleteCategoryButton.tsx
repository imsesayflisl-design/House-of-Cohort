"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  productCount,
}: {
  categoryId: string;
  categoryName: string;
  productCount: number;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const blocked = productCount > 0;

  async function onConfirm() {
    if (blocked) return;
    setPending(true);
    const res = await fetch(`/api/admin/categories/${categoryId}`, {
      method: "DELETE",
    });
    setPending(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to delete category");
      return;
    }
    toast.success("Category deleted");
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${categoryName}`}
          />
        }
      >
        <Trash2 className="size-4 text-destructive" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked
              ? "Category in use"
              : `Delete "${categoryName}"?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? `${productCount} product${productCount === 1 ? "" : "s"} still belong to this category. Move or delete them first.`
              : "This action is permanent."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {blocked ? "Close" : "Cancel"}
          </AlertDialogCancel>
          {!blocked && (
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {pending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
