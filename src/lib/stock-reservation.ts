import { prisma } from "./prisma";

// Configuration constants
const RESERVATION_DURATION_MINUTES = 20;
const CLEANUP_BATCH_SIZE = 100;

export interface ReservationResult {
  success: boolean;
  message?: string;
  reservationId?: string;
}

export interface StockAvailability {
  variantId: string;
  totalStock: number;
  reservedStock: number;
  availableStock: number;
}

/**
 * Reserve stock for a specific order
 * Creates reservations for each cart item with expiration time
 */
export async function reserveStock(
  orderId: string,
  items: Array<{ variantId: string; quantity: number }>
): Promise<ReservationResult> {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + RESERVATION_DURATION_MINUTES);

  try {
    // Use a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // First, check if reservations already exist for this order (idempotency)
      const existingReservations = await tx.stockReservation.findMany({
        where: { orderId }
      });

      if (existingReservations.length > 0) {
        throw new Error("Reservations already exist for this order");
      }

      // Check availability for all items before creating any reservations
      for (const item of items) {
        const availability = await getAvailableStockInternal(tx, item.variantId);

        if (availability.availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for variant ${item.variantId}. ` +
            `Requested: ${item.quantity}, Available: ${availability.availableStock}`
          );
        }
      }

      // Create reservations for all items
      // Note: We create one reservation record per variant in this order
      // Each reservation uses the actual order ID for proper foreign key relationship
      for (const item of items) {
        await tx.stockReservation.create({
          data: {
            variantId: item.variantId,
            quantity: item.quantity,
            orderId: orderId, // Use actual order ID for foreign key relationship
            expiresAt,
          },
        });
      }
    });

    return {
      success: true,
      message: `Stock reserved for ${RESERVATION_DURATION_MINUTES} minutes`,
      reservationId: orderId,
    };
  } catch (error) {
    console.error("Stock reservation failed:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Stock reservation failed",
    };
  }
}

/**
 * Release stock reservations for a specific order
 * Called when order expires or payment fails
 */
export async function releaseReservation(orderId: string): Promise<boolean> {
  try {
    const result = await prisma.stockReservation.deleteMany({
      where: {
        orderId: orderId,
      },
    });

    console.log(`Released ${result.count} stock reservations for order ${orderId}`);
    return result.count > 0;
  } catch (error) {
    console.error("Failed to release reservation:", error);
    return false;
  }
}

/**
 * Convert stock reservations to actual stock decrement
 * Called when payment is successfully completed
 */
export async function confirmReservation(orderId: string): Promise<boolean> {
  try {
    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Get all reservations for this order
      const reservations = await tx.stockReservation.findMany({
        where: {
          orderId: orderId,
        },
        include: {
          variant: true,
        },
      });

      if (reservations.length === 0) {
        throw new Error("No reservations found for this order");
      }

      // Decrement actual stock for each reservation
      for (const reservation of reservations) {
        await tx.productVariant.update({
          where: { id: reservation.variantId },
          data: {
            stock: { decrement: reservation.quantity },
          },
        });
      }

      // Delete the reservations after confirming
      await tx.stockReservation.deleteMany({
        where: {
          orderId: orderId,
        },
      });
    });

    console.log(`Confirmed stock reservation for order ${orderId}`);
    return true;
  } catch (error) {
    console.error("Failed to confirm reservation:", error);
    return false;
  }
}

/**
 * Get available stock for a product variant
 * Calculates total stock minus reserved stock
 */
export async function getAvailableStock(variantId: string): Promise<StockAvailability> {
  return getAvailableStockInternal(prisma, variantId);
}

/**
 * Internal helper for getting available stock (can use custom transaction)
 */
type DbClient = Omit<
  typeof prisma,
  "$connect" | "$disconnect" | "$on" | "$use" | "$transaction" | "$extends"
>;

async function getAvailableStockInternal(
  client: DbClient,
  variantId: string
): Promise<StockAvailability> {
  // Get variant with current reservations
  const variant = await client.productVariant.findUnique({
    where: { id: variantId },
    include: {
      reservations: {
        where: {
          expiresAt: {
            gt: new Date(), // Only count non-expired reservations
          },
        },
      },
    },
  });

  if (!variant) {
    throw new Error(`Product variant ${variantId} not found`);
  }

  const totalStock = variant.stock;
  const reservedStock = variant.reservations.reduce(
    (sum, reservation) => sum + reservation.quantity,
    0
  );
  const availableStock = Math.max(0, totalStock - reservedStock);

  return {
    variantId,
    totalStock,
    reservedStock,
    availableStock,
  };
}

/**
 * Cleanup expired stock reservations
 * Should be called periodically as a background job
 */
export async function cleanupExpiredReservations(): Promise<number> {
  try {
    const now = new Date();

    // Find expired reservations in batches
    let totalCleaned = 0;
    let hasMore = true;

    while (hasMore) {
      const expiredReservations = await prisma.stockReservation.findMany({
        where: {
          expiresAt: {
            lte: now,
          },
        },
        take: CLEANUP_BATCH_SIZE,
        select: { id: true, orderId: true, variantId: true, quantity: true },
      });

      if (expiredReservations.length === 0) {
        hasMore = false;
        break;
      }

      // Delete expired reservations
      const deletedCount = await prisma.stockReservation.deleteMany({
        where: {
          id: {
            in: expiredReservations.map(r => r.id),
          },
        },
      });

      totalCleaned += deletedCount.count;

      console.log(`Cleaned up ${deletedCount.count} expired stock reservations`);

      // If we got fewer results than batch size, we're done
      if (expiredReservations.length < CLEANUP_BATCH_SIZE) {
        hasMore = false;
      }
    }

    if (totalCleaned > 0) {
      console.log(`Total expired reservations cleaned: ${totalCleaned}`);
    }

    return totalCleaned;
  } catch (error) {
    console.error("Failed to cleanup expired reservations:", error);
    return 0;
  }
}

/**
 * Get reservation status for a specific order
 */
export async function getReservationStatus(orderId: string) {
  try {
    const reservations = await prisma.stockReservation.findMany({
      where: {
        orderId: orderId,
      },
      include: {
        variant: {
          select: {
            id: true,
            size: true,
            product: {
              select: { name: true },
            },
          },
        },
      },
    });

    return {
      exists: reservations.length > 0,
      reservations: reservations.map(r => ({
        variantId: r.variantId,
        quantity: r.quantity,
        expiresAt: r.expiresAt,
        productName: r.variant.product.name,
        size: r.variant.size,
      })),
    };
  } catch (error) {
    console.error("Failed to get reservation status:", error);
    return { exists: false, reservations: [] };
  }
}