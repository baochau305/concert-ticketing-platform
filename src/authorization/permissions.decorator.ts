import { SetMetadata } from '@nestjs/common';
import { PERMISSIONS_KEY } from './authorization.constants';

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
