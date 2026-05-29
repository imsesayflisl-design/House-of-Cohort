import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  buildProductWhere,
  paginate,
  parseProductSearchParams,
  sortProducts,
} from "@/lib/products";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = parseProductSearchParams(url.searchParams);
  const where = buildProductWhere(params);

  const all = await prisma.product.findMany({
    where,
    include: {
      variants: { select: { id: true, price: true, stock: true, size: true } },
      category: { select: { name: true, slug: true } },
    },
  });

  const sorted = sortProducts(all, params.sort);
  const page = paginate(sorted, params.page);

  return NextResponse.json({
    products: page.items,
    pagination: {
      page: page.page,
      pageSize: page.pageSize,
      total: page.total,
      totalPages: page.totalPages,
    },
  });
}
