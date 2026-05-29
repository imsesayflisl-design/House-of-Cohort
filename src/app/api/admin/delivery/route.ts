import { NextResponse } from "next/server";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deliveryZoneCreateSchema } from "@/lib/validators/delivery";

export async function GET() {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const zones = await prisma.deliveryZone.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  return NextResponse.json({ zones });
}

export async function POST(req: Request) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = deliveryZoneCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const zone = await prisma.deliveryZone.create({ data: parsed.data });
  return NextResponse.json({ zone }, { status: 201 });
}
