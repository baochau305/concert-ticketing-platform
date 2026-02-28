import { SetMetadata } from '@nestjs/common';
import { CHECK_POLICIES_KEY } from './authorization.constants';
import { PolicyMetadata } from './policy.interface';

export const CheckPolicies = (...policies: PolicyMetadata[]) =>
  SetMetadata(CHECK_POLICIES_KEY, policies);
