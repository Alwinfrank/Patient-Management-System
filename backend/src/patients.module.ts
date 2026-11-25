import { Module } from '@nestjs/common'; import { PatientsController, PatientsService } from './patients';
@Module({ controllers: [PatientsController], providers: [PatientsService] }) export class PatientsModule {}
