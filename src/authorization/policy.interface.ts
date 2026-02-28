import { Type } from '@nestjs/common';
import { AuthenticatedUser } from './auth.types';

export interface PolicyHandler<TResource = unknown> {
  handle(user: AuthenticatedUser, resource: TResource): boolean;
}

export interface PolicyMetadata {
  handler: Type<PolicyHandler>;
  resourceKey?: string;
}
