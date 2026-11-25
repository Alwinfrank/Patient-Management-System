import { Module } from '@nestjs/common'; import { BillingController, BillingService } from './billing';
@Module({ controllers: [BillingController], providers: [BillingService] }) export class BillingModule {}
