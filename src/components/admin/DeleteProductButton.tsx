"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
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

export function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onConfirm() {
    setPending(true);
    const res = await fetch(`/api/admin/products/${productId}`, {
      method: "DELETE",
    });
    setPending(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to delete product");
      return;
    }

    const body = await res.json().catch(() => ({}));
    toast.success(
      body?.softDeleted
        ? "Product deactivated (referenced by past orders)"
        : "Product deleted",
    );
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${productName}`}
          />
        }
      >
        <Trash2 className="size-4 text-destructive" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{productName}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the product from the storefront. If past orders
            reference it, the product will be deactivated instead of fully
            deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
