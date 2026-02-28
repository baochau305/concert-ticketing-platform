import { Injectable } from '@nestjs/common';
import { AuthenticatedUser } from './auth.types';
import { PolicyHandler } from './policy.interface';
import { RoleName } from './role.enum';

export interface EventResource {
  id: number;
  organizerId: number;
}

export interface TicketResource {
  id: number;
  customerId: number;
  eventId: number;
}

export interface StaffScanResource {
  ticketId: number;
  eventId: number;
  assignedStaffIds: number[];
}

@Injectable()
export class OrganizerOwnsEventPolicy implements PolicyHandler<
  EventResource | undefined
> {
  handle(
    user: AuthenticatedUser,
    resource: EventResource | undefined,
  ): boolean {
    if (!resource) {
      return false;
    }

    return (
      user.roles.includes(RoleName.ORGANIZER) &&
      resource.organizerId === user.userId
    );
  }
}

@Injectable()
export class CustomerOwnsTicketPolicy implements PolicyHandler<
  TicketResource | undefined
> {
  handle(
    user: AuthenticatedUser,
    resource: TicketResource | undefined,
  ): boolean {
    if (!resource) {
      return false;
    }

    return (
      user.roles.includes(RoleName.CUSTOMER) &&
      resource.customerId === user.userId
    );
  }
}

@Injectable()
export class StaffAssignedEventPolicy implements PolicyHandler<
  StaffScanResource | undefined
> {
  handle(
    user: AuthenticatedUser,
    resource: StaffScanResource | undefined,
  ): boolean {
    if (!resource) {
      return false;
    }

    return (
      user.roles.includes(RoleName.STAFF) &&
      resource.assignedStaffIds.includes(user.userId)
    );
  }
}
