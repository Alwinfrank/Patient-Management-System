import { Body, Controller, Get, Module, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { JwtAuthGuard, Roles, RolesGuard } from './common';
import { UsersService } from './users';

class CreateUserDto {
  @IsString() @MinLength(2) name: string;
  @IsEmail() email: string;
  @IsString() @MinLength(10) password: string;
  @IsEnum(UserRole) role: UserRole;
}

@ApiTags('Users') @ApiBearerAuth() @Controller('users') @UseGuards(JwtAuthGuard, RolesGuard) @Roles(UserRole.Admin)
export class UsersController {
  constructor(private service: UsersService) {}
  @Get() list() { return this.service.list(); }
  @Post() create(@Body() dto: CreateUserDto) { return this.service.create(dto); }
}

@Module({ controllers: [UsersController], providers: [UsersService, RolesGuard], exports: [UsersService] }) export class UsersModule {}
