import { Controller, Get, Injectable, NotFoundException, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';
import { JwtAuthGuard } from './common';

/** Read-only access to existing payment records. This application does not process payments. */
@Injectable()
export class PaymentsService {
  constructor(private db: PrismaService) {}

  async get(id: string) {
    const payment = await this.db.payment.findUnique({
      where: { id },
      include: { bill: { include: { patient: true } } },
    });
    if (!payment) throw new NotFoundException('Payment record not found');
    return payment;
  }

  byBill(id: string) {
    return this.db.payment.findMany({ where: { billId: id }, orderBy: { createdAt: 'desc' } });
  }
}

@ApiTags('Payment history')
@ApiBearerAuth()
@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Get('bill/:billId')
  byBill(@Param('billId', new ParseUUIDPipe()) id: string) { return this.service.byBill(id); }

  @Get(':id')
  get(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.get(id); }
}
