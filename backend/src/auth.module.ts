import { Module } from '@nestjs/common'; import { AuthController, AuthService } from './auth'; import { UsersModule } from './users.module';
@Module({ imports: [UsersModule], controllers: [AuthController], providers: [AuthService], exports: [AuthService] }) export class AuthModule {}
