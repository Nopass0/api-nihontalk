import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const testDbUrl = process.env.DATABASE_URL?.replace(
  /\/([^/]*)$/,
  '/$1_test'
);

export async function setupTestDatabase() {
  // Create test database
  try {
    execSync(`createdb ${testDbUrl?.split('/').pop()}`);
  } catch (error) {
    // Database might already exist
  }

  // Update DATABASE_URL to point to test database
  process.env.DATABASE_URL = testDbUrl;

  // Run migrations
  execSync('npx prisma migrate deploy');

  // Create Prisma client
  const prisma = new PrismaClient();

  return prisma;
}

export async function teardownTestDatabase() {
  const dbName = testDbUrl?.split('/').pop();
  
  // Disconnect all clients
  await global.prisma.$disconnect();

  // Drop test database
  try {
    execSync(`dropdb ${dbName}`);
  } catch (error) {
    console.error('Error dropping test database:', error);
  }
}