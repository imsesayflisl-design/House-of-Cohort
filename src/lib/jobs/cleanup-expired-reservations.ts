import { cleanupExpiredReservations } from "../stock-reservation";

/**
 * Background job to cleanup expired stock reservations
 * Should be run periodically (e.g., every 5 minutes)
 */
export async function runExpiredReservationCleanup() {
  console.log("Starting expired reservation cleanup job...");

  try {
    const startTime = Date.now();
    const cleanedCount = await cleanupExpiredReservations();
    const duration = Date.now() - startTime;

    if (cleanedCount > 0) {
      console.log(
        `✅ Expired reservation cleanup completed: ${cleanedCount} reservations cleaned in ${duration}ms`
      );
    } else {
      console.log(`✅ Expired reservation cleanup completed: No expired reservations found (${duration}ms)`);
    }

    return {
      success: true,
      cleanedCount,
      duration,
    };
  } catch (error) {
    console.error("❌ Expired reservation cleanup failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Express/Next.js route handler for manual cleanup trigger
 * Can be called via HTTP for testing or manual cleanup
 */
export async function handleCleanupRequest() {
  return runExpiredReservationCleanup();
}