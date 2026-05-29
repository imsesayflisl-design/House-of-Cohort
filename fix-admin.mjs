
import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function debugAdmin() {
  try {
    console.log('🔍 Checking admin user in database...');

    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@houseofcohort.com' },
      select: { id: true, email: true, name: true, role: true, password: true, isActive: true }
    });

    if (!adminUser) {
      console.log('❌ Admin user not found. Creating new admin...');

      // Hash the password properly
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

      console.log('✅ Admin user created:');
      console.log('  ID:', newAdmin.id);
      console.log('  Email:', newAdmin.email);
      console.log('  Role:', newAdmin.role);
      console.log('  Active:', newAdmin.isActive);
    } else {
      console.log('✅ Admin user found:');
      console.log('  ID:', adminUser.id);
      console.log('  Email:', adminUser.email);
      console.log('  Role:', adminUser.role);
      console.log('  Active:', adminUser.isActive);
      console.log('  Has Password:', !!adminUser.password);

      // Update password to ensure it's correct
      console.log('🔧 Updating password...');
      const hashedPassword = await bcryptjs.hash('Admin123!', 12);

      await prisma.user.update({
        where: { email: 'admin@houseofcohort.com' },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      });

      console.log('✅ Password updated successfully!');
    }

    // Test password verification
    console.log('🧪 Testing password verification...');
    const updatedUser = await prisma.user.findUnique({
      where: { email: 'admin@houseofcohort.com' }
    });

    const passwordMatch = await bcryptjs.compare('Admin123!', updatedUser.password);
    console.log('🔐 Password verification:', passwordMatch ? '✅ SUCCESS' : '❌ FAILED');

    console.log('\n📝 Login Credentials:');
    console.log('Email: admin@houseofcohort.com');
    console.log('Password: Admin123!');
    console.log('URL: http://localhost:3000/auth/signin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAdmin();
