import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const staffEmail = process.env.STAFF_EMAIL;
  const staffPassword = process.env.STAFF_PASSWORD;
  if (!email || !password || password === 'replace-with-a-strong-password') throw new Error('Set ADMIN_EMAIL and a strong ADMIN_PASSWORD before seeding.');
  if (!staffEmail || !staffPassword || staffPassword === 'replace-with-a-strong-password') throw new Error('Set STAFF_EMAIL and a strong STAFF_PASSWORD before seeding.');
  if (email.toLowerCase() === staffEmail.toLowerCase()) throw new Error('Admin and staff accounts must use different email addresses.');
  const adminName = process.env.ADMIN_NAME || 'System Administrator';
  const staffName = process.env.STAFF_NAME || 'Clinic Staff';
  const adminHash = await bcrypt.hash(password, 12);
  const staffHash = await bcrypt.hash(staffPassword, 12);
  await prisma.user.upsert({ where: { email: email.toLowerCase() }, update: { name: adminName, password: adminHash, role: UserRole.Admin }, create: { name: adminName, email: email.toLowerCase(), password: adminHash, role: UserRole.Admin } });
  await prisma.user.upsert({ where: { email: staffEmail.toLowerCase() }, update: { name: staffName, password: staffHash, role: UserRole.Staff }, create: { name: staffName, email: staffEmail.toLowerCase(), password: staffHash, role: UserRole.Staff } });
}
main()
  .catch((error) => {
    if (error.code === 'P1001' || error.code === 'P1003') {
      console.error('Seed stopped: MySQL is unavailable. Start MySQL and confirm DATABASE_URL in backend/.env.');
    } else {
      console.error('Seed failed. Check the database configuration and account settings in backend/.env.');
    }
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
