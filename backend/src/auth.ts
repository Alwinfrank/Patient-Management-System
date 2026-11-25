import { Body, Controller, Get, Injectable, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { UsersService } from './users';
import { CurrentUser, JwtAuthGuard } from './common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as bcrypt from 'bcrypt';
export class LoginDto { @IsEmail() email: string; @IsString() @MinLength(1) password: string; }
@Injectable() export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}
  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email.toLowerCase());
    if (!user || !(await bcrypt.compare(dto.password, user.password))) throw new UnauthorizedException('Email or password is incorrect');
    return { accessToken: this.jwt.sign({ sub: user.id, email: user.email, role: user.role }), user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
  async profile(id: string) { const user = await this.users.findPublicById(id); if (!user) throw new UnauthorizedException('User account no longer exists'); return user; }
}
@ApiTags('Authentication') @Controller('auth') export class AuthController { constructor(private auth: AuthService) {} @Post('login') login(@Body() dto: LoginDto) { return this.auth.login(dto); } @Get('me') @UseGuards(JwtAuthGuard) @ApiBearerAuth() async me(@CurrentUser() user: { sub: string }) { return this.auth.profile(user.sub); } }
