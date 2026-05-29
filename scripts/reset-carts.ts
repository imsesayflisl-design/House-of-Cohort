import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const cartItems = await prisma.cartItem.deleteMany({});
  const carts = await prisma.cart.deleteMany({});
  const wishes = await prisma.wishlistItem.deleteMany({});
  const reviews = await prisma.review.deleteMany({});
  console.log("Deleted:", { cartItems: cartItems.count, carts: carts.count, wishes: wishes.count, reviews: reviews.count });
  await prisma.$disconnect();
}
main().catch((e) => { console.error(e); process.exit(1); });
