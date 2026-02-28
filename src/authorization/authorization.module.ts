import { Module } from '@nestjs/common';
import { PermissionsGuard } from './permissions.guard';
import { PoliciesGuard } from './policies.guard';
import { RolesGuard } from './roles.guard';
import {
  CustomerOwnsTicketPolicy,
  OrganizerOwnsEventPolicy,
  StaffAssignedEventPolicy,
} from './policy-handlers';

@Module({
  providers: [
    RolesGuard,
    PermissionsGuard,
    PoliciesGuard,
    OrganizerOwnsEventPolicy,
    CustomerOwnsTicketPolicy,
    StaffAssignedEventPolicy,
  ],
  exports: [
    RolesGuard,
    PermissionsGuard,
    PoliciesGuard,
    OrganizerOwnsEventPolicy,
    CustomerOwnsTicketPolicy,
    StaffAssignedEventPolicy,
  ],
})
export class AuthorizationModule {}
