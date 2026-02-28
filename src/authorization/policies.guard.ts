import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { CHECK_POLICIES_KEY } from './authorization.constants';
import { AuthenticatedUser } from './auth.types';
import { PolicyHandler, PolicyMetadata } from './policy.interface';

@Injectable()
export class PoliciesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly moduleRef: ModuleRef,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const policies = this.reflector.getAllAndOverride<PolicyMetadata[]>(
      CHECK_POLICIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policies?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    for (const policy of policies) {
      const handler = this.moduleRef.get<PolicyHandler>(policy.handler, {
        strict: false,
      });
      const resource = policy.resourceKey
        ? request[policy.resourceKey]
        : request.resource;

      if (!handler.handle(user, resource)) {
        throw new ForbiddenException('Resource policy denied');
      }
    }

    return true;
  }
}
