import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { auth, requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  name: z.string().min(1).optional(),
});

function generateTempPassword() {
  return randomBytes(8).toString("hex");
}

export async function GET() {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const staff = await prisma.user.findMany({
    where: { role: { in: ["STAFF", "ADMIN"] } },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ staff });
}

export async function POST(req: Request) {
  const session = await auth();
  const denied = requireAdmin(session);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = inviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return NextResponse.json(
      { error: "A user with this email already exists" },
      { status: 409 },
    );
  }

  const tempPassword = generateTempPassword();
  const hashed = await bcrypt.hash(tempPassword, 12);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name ?? null,
      password: hashed,
      role: "STAFF",
      isActive: true,
    },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  // TODO: replace with Resend invite email — for now we log + return the temp password once.
  console.log(
    `[staff invite] ${user.email} temporary password: ${tempPassword}`,
  );

  return NextResponse.json({ user, tempPassword }, { status: 201 });
}
