"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Role } from "@/generated/prisma/enums";

export function StaffRoleSelect({
  staffId,
  currentRole,
  disabled,
}: {
  staffId: string;
  currentRole: Role;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [role, setRole] = useState<Role>(currentRole);
  const [pending, setPending] = useState(false);

  async function onChange(next: string | null) {
    if (!next || next === role) return;
    const previous = role;
    setRole(next as Role);
    setPending(true);
    const res = await fetch(`/api/admin/staff/${staffId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: next }),
    });
    setPending(false);

    if (!res.ok) {
      setRole(previous);
      const body = await res.json().catch(() => ({}));
      toast.error(body?.error ?? "Failed to update role");
      return;
    }
    toast.success(`Role set to ${next}`);
    router.refresh();
  }

  return (
    <Select
      value={role}
      onValueChange={onChange}
      disabled={disabled || pending}
    >
      <SelectTrigger className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="STAFF">Staff</SelectItem>
        <SelectItem value="ADMIN">Admin</SelectItem>
      </SelectContent>
    </Select>
  );
}
