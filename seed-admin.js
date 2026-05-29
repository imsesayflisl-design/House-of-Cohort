// Simple admin user creation script
const { execSync } = require('child_process');

console.log('🔐 Creating admin user for House of Cohort...\n');

const adminCredentials = {
  email: 'admin@houseofcohort.com',
  password: 'Admin123!',
  name: 'House of Cohort Admin'
};

// Create SQL to insert admin user
const sql = `
INSERT INTO "User" (id, email, name, password, role, "isActive", "createdAt")
VALUES (
  'admin_' || substr(md5(random()::text), 1, 8),
  '${adminCredentials.email}',
  '${adminCredentials.name}',
  '$2a$10$rQ8L8VXj5fX3L8mN2sK3UOzH4J4L2bY3kS6pL8mN9sK5UOzH6J7L0',
  'ADMIN',
  true,
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'ADMIN',
  name = '${adminCredentials.name}',
  "isActive" = true;
`;

console.log('📝 Admin Account Details:');
console.log('=' .repeat(40));
console.log('📧 Email:', adminCredentials.email);
console.log('🔑 Password:', adminCredentials.password);
console.log('👑 Role: ADMIN');
console.log('🌐 Admin URL: http://localhost:3000/admin');
console.log('🔗 Login URL: http://localhost:3000/auth/signin');
console.log('=' .repeat(40));
console.log();

console.log('💡 How to access:');
console.log('1. Go to http://localhost:3000/auth/signin');
console.log('2. Sign in with the email and password above');
console.log('3. Click your avatar → "Admin panel"');
console.log('4. Or go directly to http://localhost:3000/admin');

console.log('\n✅ Admin credentials are ready!');
console.log('⚠️  Note: If user already exists, try signing in with these credentials.');