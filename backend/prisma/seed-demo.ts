import { Gender, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const demoPatients = [
  { name: 'Aarav Sharma', age: 32, gender: Gender.Male, phoneNumber: '9000000001', email: 'aarav.sharma@example.test', address: '12 Lake View Road, Bengaluru' },
  { name: 'Maya Iyer', age: 27, gender: Gender.Female, phoneNumber: '9000000002', email: 'maya.iyer@example.test', address: '8 Green Park, Chennai' },
  { name: 'Rohan Das', age: 45, gender: Gender.Male, phoneNumber: '9000000003', email: 'rohan.das@example.test', address: '21 Hill Street, Kochi' },
];

const demoBills = [
  { patientEmail: 'aarav.sharma@example.test', description: 'General consultation', amount: 800, taxRate: 5 },
  { patientEmail: 'maya.iyer@example.test', description: 'Dental checkup', amount: 1200, taxRate: 5 },
  { patientEmail: 'rohan.das@example.test', description: 'Health screening', amount: 2500, taxRate: 0 },
];

async function main() {
  for (const patient of demoPatients) {
    await prisma.patient.upsert({ where: { email: patient.email }, update: {}, create: patient });
  }

  for (const item of demoBills) {
    const patient = await prisma.patient.findUniqueOrThrow({ where: { email: item.patientEmail } });
    const exists = await prisma.bill.findFirst({ where: { patientId: patient.id, description: item.description } });
    if (exists) continue;
    const amount = Math.round(item.amount * 100);
    const tax = Math.round(amount * item.taxRate / 100);
    await prisma.bill.create({ data: {
      patientId: patient.id,
      description: item.description,
      amount: (amount / 100).toFixed(2),
      tax: (tax / 100).toFixed(2),
      totalAmount: ((amount + tax) / 100).toFixed(2),
    } });
  }

  console.log('Demo data is ready: 3 fictional patients and 3 invoices.');
}

main()
  .catch((error) => {
    console.error('Could not add demo data. Check that MySQL is running and backend/.env has a valid DATABASE_URL.');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
