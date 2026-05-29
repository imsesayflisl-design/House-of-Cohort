import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const zones = await prisma.deliveryZone.findMany({
      where: { isActive: true }
    });

    return NextResponse.json({ zones });
  } catch (error) {
    console.error("Error fetching delivery zones:", error);
    return NextResponse.json(
      { error: "Failed to fetch delivery zones" },
      { status: 500 }
    );
  }
}