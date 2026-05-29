import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    console.log('🔍 Debugging admin user...');

    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@houseofcohort.com' },
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Creating...');

      // Hash password with higher rounds for security
      const hashedPassword = await bcryptjs.hash('Admin123!', 12);

      const newAdmin = await prisma.user.create({
        data: {
          email: 'admin@houseofcohort.com',
          name: 'House of Cohort Admin',
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      });

      console.log('✅ Admin created:', newAdmin.email);
      return NextResponse.json({
        status: 'created',
        message: 'Admin user created successfully',
        email: newAdmin.email,
        role: newAdmin.role
      });
    }

    console.log('✅ Admin found, updating password...');

    // Update password to ensure it's correct
    const hashedPassword = await bcryptjs.hash('Admin123!', 12);

    await prisma.user.update({
      where: { email: 'admin@houseofcohort.com' },
      data: {
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true
      }
    });

    // Test password verification
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'admin@houseofcohort.com' }
    });

    const passwordMatch = await bcryptjs.compare('Admin123!', updatedUser!.password!);

    return NextResponse.json({
      status: 'updated',
      message: 'Admin user updated successfully',
      email: adminUser.email,
      role: adminUser.role,
      passwordVerified: passwordMatch,
      hasPassword: !!adminUser.password
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to debug admin user', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}