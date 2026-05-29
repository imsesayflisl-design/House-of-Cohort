import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const carts = await prisma.cart.findMany({
    include: { items: true, user: { select: { email: true } } },
  });
  for (const c of carts) {
    console.log(
      "Cart:",
      c.id.slice(-8),
      "user=" + (c.user?.email ?? "guest"),
      "session=" + (c.sessionId ?? "-"),
      "items=" +
        c.items.map((i) => `${i.variantId.slice(-8)}×${i.quantity}`).join(","),
    );
  }
  const wishes = await prisma.wishlistItem.findMany({
    include: { user: { select: { email: true } }, product: { select: { name: true } } },
  });
  for (const w of wishes) console.log("Wishlist:", w.user.email, "->", w.product.name);
  const reviews = await prisma.review.findMany({
    include: { user: { select: { email: true } }, product: { select: { name: true } } },
  });
  for (const r of reviews) console.log("Review:", r.user.email, "->", r.product.name, "★" + r.rating);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
