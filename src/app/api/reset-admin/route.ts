import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const adminEmail = "admin@houseofcohort.com";
    const newPassword = "Admin123!";

    // Delete existing admin if exists
    await prisma.user.deleteMany({
      where: { email: adminEmail }
    });

    // Create fresh admin user
    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "House of Cohort Admin",
        password: hashedPassword,
        role: "ADMIN",
        isActive: true,
      },
    });

    // Verify password works
    const passwordCheck = await bcryptjs.compare(newPassword, admin.password!);

    return NextResponse.json({
      success: true,
      message: "Admin user reset successfully",
      email: admin.email,
      role: admin.role,
      passwordWorks: passwordCheck,
      credentials: {
        email: adminEmail,
        password: newPassword
      }
    });

  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset admin",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}