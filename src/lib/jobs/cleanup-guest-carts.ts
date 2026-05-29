import { prisma } from "../prisma";

// Configuration constants
const GUEST_CART_EXPIRY_DAYS = 30;
const CLEANUP_BATCH_SIZE = 100;

/**
 * Background job to cleanup orphaned guest carts
 * Should be run daily to remove carts older than 30 days
 */
export async function runGuestCartCleanup() {
  console.log("Starting guest cart cleanup job...");

  try {
    const startTime = Date.now();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - GUEST_CART_EXPIRY_DAYS);

    let totalCleaned = 0;
    let hasMore = true;

    while (hasMore) {
      // Find orphaned guest carts in batches
      const orphanedCarts = await prisma.cart.findMany({
        where: {
          userId: null, // Guest carts only
          updatedAt: {
            lt: cutoffDate,
          },
        },
        take: CLEANUP_BATCH_SIZE,
        include: {
          items: true,
        },
      });

      if (orphanedCarts.length === 0) {
        hasMore = false;
        break;
      }

      // Delete cart items first (due to foreign key constraints)
      const cartIds = orphanedCarts.map(cart => cart.id);

      await prisma.$transaction(async (tx) => {
        // Delete cart items
        await tx.cartItem.deleteMany({
          where: {
            cartId: {
              in: cartIds,
            },
          },
        });

        // Delete carts
        await tx.cart.deleteMany({
          where: {
            id: {
              in: cartIds,
            },
          },
        });
      });

      totalCleaned += orphanedCarts.length;

      console.log(
        `Cleaned ${orphanedCarts.length} guest carts (${orphanedCarts.reduce((sum, cart) => sum + cart.items.length, 0)} items)`
      );

      // If we got fewer results than batch size, we're done
      if (orphanedCarts.length < CLEANUP_BATCH_SIZE) {
        hasMore = false;
      }
    }

    const duration = Date.now() - startTime;

    if (totalCleaned > 0) {
      console.log(
        `✅ Guest cart cleanup completed: ${totalCleaned} carts cleaned in ${duration}ms`
      );
    } else {
      console.log(`✅ Guest cart cleanup completed: No orphaned carts found (${duration}ms)`);
    }

    return {
      success: true,
      cleanedCount: totalCleaned,
      duration,
      cutoffDate,
    };
  } catch (error) {
    console.error("❌ Guest cart cleanup failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get statistics about guest carts for monitoring
 */
export async function getGuestCartStats() {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - GUEST_CART_EXPIRY_DAYS);

    const [totalGuest, expiredGuest, totalItems] = await Promise.all([
      // Total guest carts
      prisma.cart.count({
        where: { userId: null },
      }),

      // Expired guest carts
      prisma.cart.count({
        where: {
          userId: null,
          updatedAt: { lt: cutoffDate },
        },
      }),

      // Total items in guest carts
      prisma.cartItem.count({
        where: {
          cart: { userId: null },
        },
      }),
    ]);

    return {
      totalGuestCarts: totalGuest,
      expiredGuestCarts: expiredGuest,
      totalGuestCartItems: totalItems,
      cutoffDate,
    };
  } catch (error) {
    console.error("Failed to get guest cart stats:", error);
    return null;
  }
}

/**
 * Express/Next.js route handler for manual cleanup trigger
 * Can be called via HTTP for testing or manual cleanup
 */
export async function handleCleanupRequest() {
  return runGuestCartCleanup();
}