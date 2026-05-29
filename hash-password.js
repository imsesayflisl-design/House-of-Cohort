const bcrypt = require('bcryptjs');

// Hash the password you want to use
const password = 'Admin@1234';
const hashedPassword = bcrypt.hashSync(password, 12);

console.log('='.repeat(50));
console.log('PASSWORD HASH GENERATOR');
console.log('='.repeat(50));
console.log('Original Password:', password);
console.log('Hashed Password:', hashedPassword);
console.log('='.repeat(50));
console.log('\nUse this hash in Prisma Studio:');
console.log(hashedPassword);