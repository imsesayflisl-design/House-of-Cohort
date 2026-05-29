import { PrismaClient } from './src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

async function createAdminUser() {
  const prisma = new PrismaClient();

  try {
    // Check existing admin users
    console.log('Checking existing admin users...');
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true, role: true }
    });

    console.log('Existing admin users:');
    if (admins.length === 0) {
      console.log('❌ No admin users found.');
    } else {
      admins.forEach(admin => {
        console.log(`✅ ${admin.email} (${admin.name || 'No name'})`);
      });
    }

    // Admin credentials
    const adminEmail = 'admin@houseofcohort.com';
    const adminPassword = 'Admin123!';
    const adminName = 'House of Cohort Admin';

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (existingAdmin) {
      console.log(`\n⚠️  Admin user already exists: ${adminEmail}`);
      console.log('Role:', existingAdmin.role);
      if (existingAdmin.role !== 'ADMIN') {
        // Update to admin role
        await prisma.user.update({
          where: { email: adminEmail },
          data: { role: 'ADMIN' }
        });
        console.log('✅ Updated user to ADMIN role');
      }
    } else {
      // Hash the password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      // Create admin user
      const newAdmin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: adminName,
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true
        }
      });

      console.log('\n🎉 Admin user created successfully!');
      console.log('📧 Email:', adminEmail);
      console.log('🔑 Password:', adminPassword);
      console.log('👑 Role:', newAdmin.role);
    }

    console.log('\n📝 Admin Credentials:');
    console.log('Email: admin@houseofcohort.com');
    console.log('Password: Admin123!');
    console.log('URL: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();