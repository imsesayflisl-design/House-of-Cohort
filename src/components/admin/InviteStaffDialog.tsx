"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Copy, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  name: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function InviteStaffDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tempPassword, setTempPassword] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", name: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    const res = await fetch("/api/admin/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to invite staff");
      return;
    }
    const body = await res.json();
    setTempPassword({ email: body.user.email, password: body.tempPassword });
    toast.success("Staff invited");
    router.refresh();
  }

  function reset() {
    form.reset();
    setTempPassword(null);
    setCopied(false);
  }

  async function copy() {
    if (!tempPassword) return;
    await navigator.clipboard.writeText(tempPassword.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger
        render={
          <Button className="bg-brand-gold text-brand-black hover:bg-brand-gold-light" />
        }
      >
        <Plus className="size-4" /> Invite staff
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tempPassword ? "Invite sent" : "Invite a staff member"}
          </DialogTitle>
        </DialogHeader>

        {tempPassword ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Share this temporary password with{" "}
              <span className="font-mono">{tempPassword.email}</span>. It will
              not be shown again.
            </p>
            <div className="flex items-center gap-2 rounded-md border border-brand-gold/40 bg-brand-gold/5 p-3">
              <code className="flex-1 font-mono text-sm">
                {tempPassword.password}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copy}
              >
                {copied ? (
                  <>
                    <Check className="size-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Copy
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Resend integration will replace this manual step. The
              password is also written to the server console for redundancy.
            </p>
            <DialogFooter>
              <Button onClick={() => setOpen(false)}>Done</Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div>
              <Label htmlFor="staff-name">Name (optional)</Label>
              <Input id="staff-name" {...form.register("name")} />
            </div>
            <div>
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                autoComplete="off"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-brand-gold text-brand-black hover:bg-brand-gold-light"
              >
                {submitting ? "Inviting…" : "Send invite"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
