const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to database successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

testConnection();

module.exports = {
  prisma,
  testConnection
};
