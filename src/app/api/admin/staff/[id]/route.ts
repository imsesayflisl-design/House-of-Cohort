import { NextResponse } from "next/server";
import { z } from "zod";

import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

const patchSchema = z
  .object({
    role: z.enum(["STAFF", "ADMIN"] as [Role, Role]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.role !== undefined || v.isActive !== undefined, {
    message: "Nothing to update",
  });

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const { id } = await params;

  if (id === session?.user.id) {
    return NextResponse.json(
      { error: "You cannot change your own role or status." },
      { status: 400 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || (target.role !== "STAFF" && target.role !== "ADMIN")) {
    return NextResponse.json({ error: "Staff member not found" }, { status: 404 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.role !== undefined && { role: parsed.data.role }),
      ...(parsed.data.isActive !== undefined && {
        isActive: parsed.data.isActive,
      }),
    },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });

  return NextResponse.json({ user });
}
