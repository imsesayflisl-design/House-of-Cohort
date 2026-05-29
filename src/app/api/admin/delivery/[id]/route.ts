import { NextResponse } from "next/server";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deliveryZoneUpdateSchema } from "@/lib/validators/delivery";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = deliveryZoneUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const existing = await prisma.deliveryZone.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Zone not found" }, { status: 404 });
  }

  const zone = await prisma.deliveryZone.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ zone });
}
