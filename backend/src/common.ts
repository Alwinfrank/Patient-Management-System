import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator, SetMetadata, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
export const ROLES_KEY = 'required_roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwt: JwtService) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest(); const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) throw new UnauthorizedException('Authentication required');
    try { req.user = this.jwt.verify(token); return true; } catch { throw new UnauthorizedException('Session expired or invalid'); }
  }
}
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    if (!roles?.length) return true;
    const user = context.switchToHttp().getRequest().user;
    if (!user || !roles.includes(user.role)) throw new ForbiddenException('You do not have permission to perform this action');
    return true;
  }
}
export const CurrentUser = createParamDecorator((_data, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user);
