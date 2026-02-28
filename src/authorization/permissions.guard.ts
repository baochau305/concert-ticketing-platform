import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from './auth.types';
import { PERMISSIONS_KEY } from './authorization.constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user?.permissions?.length) {
      throw new ForbiddenException('Permission is required');
    }

    const permissionSet = new Set(user.permissions);
    const hasAllRequiredPermissions = requiredPermissions.every((permission) =>
      permissionSet.has(permission),
    );

    if (!hasAllRequiredPermissions) {
      throw new ForbiddenException('Insufficient permission');
    }

    return true;
  }
}
