const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'dev.mg4@gmail.com';
  const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  const existingAdmin = await prisma.users.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('Admin already exists. Updating password...');
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await prisma.users.update({
      where: { email },
      data: {
        password: hashedPassword,
        role: 'admin'
      }
    });
    console.log('Admin password updated successfully.');
  } else {
    console.log('Creating admin user...');
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true
      }
    });
    console.log('Admin user created successfully.');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
