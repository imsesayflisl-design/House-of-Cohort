import { NextResponse } from "next/server";
import { z } from "zod";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const bulkSchema = z.object({
  ids: z.array(z.string()).min(1, "Select at least one variant"),
  delta: z.number().int().refine((n) => n !== 0, "Delta must not be zero"),
});

export async function POST(req: Request) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const body = await req.json().catch(() => null);
  const parsed = bulkSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { ids, delta } = parsed.data;

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: ids } },
    select: { id: true, stock: true },
  });

  if (variants.length === 0) {
    return NextResponse.json({ error: "No matching variants" }, { status: 404 });
  }

  // Refuse the whole batch if any would go negative — clearer than partial application.
  const wouldGoNegative = variants.filter((v) => v.stock + delta < 0);
  if (wouldGoNegative.length > 0) {
    return NextResponse.json(
      {
        error: `Cannot apply: ${wouldGoNegative.length} variant${wouldGoNegative.length === 1 ? "" : "s"} would go below zero.`,
      },
      { status: 409 },
    );
  }

  await prisma.$transaction(
    variants.map((v) =>
      prisma.productVariant.update({
        where: { id: v.id },
        data: { stock: v.stock + delta },
      }),
    ),
  );

  return NextResponse.json({ updated: variants.length });
}
