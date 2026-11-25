import { ConflictException, Injectable } from '@nestjs/common'; import { PrismaService } from './prisma.service'; import { UserRole } from '@prisma/client'; import * as bcrypt from 'bcrypt';
@Injectable() export class UsersService {
  constructor(private db: PrismaService) {}
  findByEmail(email: string) { return this.db.user.findUnique({ where: { email } }); }
  findPublicById(id: string) { return this.db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true } }); }
  list() { return this.db.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true }, orderBy: { createdAt: 'asc' } }); }
  async create(input: { name: string; email: string; password: string; role: UserRole }) {
    try { return await this.db.user.create({ data: { ...input, email: input.email.toLowerCase(), password: await bcrypt.hash(input.password, 12) }, select: { id: true, name: true, email: true, role: true, createdAt: true } }); }
    catch (error) { if (error.code === 'P2002') throw new ConflictException('A user with this email already exists'); throw error; }
  }
}
