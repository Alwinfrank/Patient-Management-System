import { Module } from '@nestjs/common'; import { PaymentsController, PaymentsService } from './payments';
@Module({ controllers: [PaymentsController], providers: [PaymentsService] }) export class PaymentsModule {}
