import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const adminEmail = "admin@houseofcohort.com";
    const adminPassword = "Admin123!";
    const adminName = "House of Cohort Admin";

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      // Update to admin role if not already
      if (existingAdmin.role !== "ADMIN") {
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: "ADMIN" },
        });
        return NextResponse.json({
          message: "User updated to ADMIN role",
          email: adminEmail,
        });
      }
      return NextResponse.json({
        message: "Admin user already exists",
        email: adminEmail,
      });
    }

    // Hash the password
    const hashedPassword = await bcryptjs.hash(adminPassword, 10);

    // Create admin user
    const newAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    return NextResponse.json({
      message: "Admin user created successfully",
      email: newAdmin.email,
      name: newAdmin.name,
      role: newAdmin.role,
    });

  } catch (error) {
    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Failed to create admin user" },
      { status: 500 }
    );
  }
}