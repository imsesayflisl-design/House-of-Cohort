import { NextResponse } from "next/server";

import { auth, requireStaff } from "@/lib/auth";
import { runExpiredReservationCleanup } from "@/lib/jobs/cleanup-expired-reservations";
import { runGuestCartCleanup, getGuestCartStats } from "@/lib/jobs/cleanup-guest-carts";

/**
 * Manual cleanup trigger endpoint for admins
 * Supports both reservation and cart cleanup
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    requireStaff(session); // Only staff/admin can trigger cleanup

    const { type } = await req.json();

    let result;
    switch (type) {
      case "reservations":
        result = await runExpiredReservationCleanup();
        break;

      case "guest-carts":
        result = await runGuestCartCleanup();
        break;

      case "all":
        const [reservationResult, cartResult] = await Promise.all([
          runExpiredReservationCleanup(),
          runGuestCartCleanup(),
        ]);
        result = {
          reservations: reservationResult,
          carts: cartResult,
        };
        break;

      default:
        return NextResponse.json(
          { error: "Invalid cleanup type. Use: 'reservations', 'guest-carts', or 'all'" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      result,
    });

  } catch (error) {
    console.error("Manual cleanup failed:", error);
    return NextResponse.json(
      { error: "Cleanup failed" },
      { status: 500 }
    );
  }
}

/**
 * Get cleanup statistics for monitoring
 */
export async function GET() {
  try {
    const session = await auth();
    requireStaff(session); // Only staff/admin can view stats

    const guestCartStats = await getGuestCartStats();

    // Get current reservation stats
    const reservationStats = await getReservationStats();

    return NextResponse.json({
      guestCarts: guestCartStats,
      reservations: reservationStats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error("Failed to get cleanup stats:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}

/**
 * Get current stock reservation statistics
 */
async function getReservationStats() {
  try {
    const { prisma } = await import("@/lib/prisma");

    const now = new Date();

    const [totalReservations, expiredReservations] = await Promise.all([
      // Total active reservations
      prisma.stockReservation.count(),

      // Expired reservations
      prisma.stockReservation.count({
        where: {
          expiresAt: { lt: now },
        },
      }),
    ]);

    return {
      totalReservations,
      expiredReservations,
      activeReservations: totalReservations - expiredReservations,
    };
  } catch (error) {
    console.error("Failed to get reservation stats:", error);
    return null;
  }
}