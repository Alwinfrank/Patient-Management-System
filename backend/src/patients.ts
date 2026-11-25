import { Body, Controller, Delete, Get, Injectable, NotFoundException, Param, ParseEnumPipe, ParseUUIDPipe, Patch, Post, Query, UseGuards, ConflictException } from '@nestjs/common';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Matches, Max, Min, MinLength } from 'class-validator';
import { Gender } from '@prisma/client'; import { PrismaService } from './prisma.service'; import { JwtAuthGuard } from './common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
export class PatientDto {
 @IsString() @MinLength(2) name: string; @IsInt() @Min(0) @Max(120) age: number; @IsEnum(Gender) gender: Gender;
 @IsString() @Matches(/^(?=.*\d)\+?[\d\s().-]{7,20}$/) phoneNumber: string; @IsEmail() email: string; @IsString() @MinLength(3) address: string;
}
export class UpdatePatientDto {
 @IsOptional() @IsString() @MinLength(2) name?: string; @IsOptional() @IsInt() @Min(0) @Max(120) age?: number;
 @IsOptional() @IsEnum(Gender) gender?: Gender; @IsOptional() @IsString() @Matches(/^(?=.*\d)\+?[\d\s().-]{7,20}$/) phoneNumber?: string;
 @IsOptional() @IsEmail() email?: string; @IsOptional() @IsString() @MinLength(3) address?: string;
}
@Injectable() export class PatientsService {
 constructor(private db: PrismaService) {}
 async list(search?: string, gender?: Gender) { const query = search?.trim(); return this.db.patient.findMany({ where: { ...(query ? { name: { contains: query } } : {}), ...(gender ? { gender } : {}) }, orderBy: { createdAt: 'desc' } }); }
 async get(id: string) { const p = await this.db.patient.findUnique({ where: { id }, include: { bills: true } }); if (!p) throw new NotFoundException('Patient not found'); return p; }
 async create(dto: PatientDto) { try { return await this.db.patient.create({ data: { ...dto, email: dto.email.toLowerCase() } }); } catch (e) { if (e.code === 'P2002') throw new ConflictException('A patient with this email already exists'); throw e; } }
 async update(id: string, dto: Partial<PatientDto>) { await this.get(id); try { return await this.db.patient.update({ where: { id }, data: { ...dto, ...(dto.email ? { email: dto.email.toLowerCase() } : {}) } }); } catch (e) { if (e.code === 'P2002') throw new ConflictException('A patient with this email already exists'); throw e; } }
 async remove(id: string) { await this.get(id); try { await this.db.patient.delete({ where: { id } }); return { success: true }; } catch (e) { if (e.code === 'P2003') throw new ConflictException('Patients with bills cannot be deleted'); throw e; } }
}
@ApiTags('Patients') @ApiBearerAuth() @Controller('patients') @UseGuards(JwtAuthGuard) export class PatientsController {
 constructor(private service: PatientsService) {}
 @Get() list(@Query('search') search: string, @Query('gender', new ParseEnumPipe(Gender, { optional: true })) gender?: Gender) { return this.service.list(search, gender); }
 @Get(':id') get(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.get(id); }
 @Post() create(@Body() dto: PatientDto) { return this.service.create(dto); }
 @Patch(':id') update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdatePatientDto) { return this.service.update(id, dto); }
 @Delete(':id') remove(@Param('id', new ParseUUIDPipe()) id: string) { return this.service.remove(id); }
}
