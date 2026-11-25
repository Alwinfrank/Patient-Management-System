import { Controller, Get, UseGuards } from '@nestjs/common'; import { PrismaService } from './prisma.service'; import { JwtAuthGuard } from './common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
@ApiTags('Dashboard') @ApiBearerAuth() @Controller('dashboard') @UseGuards(JwtAuthGuard) export class DashboardController {
  constructor(private db: PrismaService) {}
  @Get() async stats() {
    const [totalPatients, recentPatients, totalBills, paid, pending] = await Promise.all([
      this.db.patient.count(),
      this.db.patient.findMany({ take: 5, orderBy: { createdAt: 'desc' } }),
      this.db.bill.count(),
      this.db.bill.aggregate({ where: { paymentStatus: 'Paid' }, _sum: { totalAmount: true } }),
      this.db.bill.aggregate({ where: { paymentStatus: 'Pending' }, _sum: { totalAmount: true } }),
    ]);
    return { totalPatients, recentPatients, totalBills, paidAmount: Number(paid._sum.totalAmount ?? 0), pendingAmount: Number(pending._sum.totalAmount ?? 0) };
  }
}
