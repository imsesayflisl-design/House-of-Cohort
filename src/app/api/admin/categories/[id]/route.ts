import { NextResponse } from "next/server";
import { auth, requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { categoryInputSchema } from "@/lib/validators/category";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = categoryInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const current = await prisma.category.findUnique({ where: { id } });
  if (!current) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (parsed.data.slug !== current.slug) {
    const taken = await prisma.category.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (taken && taken.id !== id) {
      return NextResponse.json({ error: "Slug already in use" }, { status: 409 });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      image: parsed.data.image ?? null,
    },
  });

  return NextResponse.json({ category });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  const denied = requireStaff(session);
  if (denied) return denied;

  const { id } = await params;

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      {
        error: `Cannot delete: ${productCount} product${productCount === 1 ? "" : "s"} still use this category.`,
      },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
