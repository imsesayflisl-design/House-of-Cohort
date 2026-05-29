import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

dotenv.config({ path: ".env.local" });

const prisma = new PrismaClient({
  adapter: new PrismaNeon({ connectionString: process.env.DATABASE_URL }),
  log: ["query"],
});

async function main() {
  const email = "admin@houseofcohort.com";
  const password = "Admin@1234";

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Admin user upserted:");
  console.log(`  Email: ${user.email}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Active: ${user.isActive}`);
  console.log(`  Password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
