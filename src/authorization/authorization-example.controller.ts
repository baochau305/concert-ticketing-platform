import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CheckPolicies } from './check-policies.decorator';
import { PermissionName } from './permission.constants';
import {
  CustomerOwnsTicketPolicy,
  OrganizerOwnsEventPolicy,
  StaffAssignedEventPolicy,
} from './policy-handlers';
import { Permissions } from './permissions.decorator';
import { PermissionsGuard } from './permissions.guard';
import { PoliciesGuard } from './policies.guard';
import { RoleName } from './role.enum';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@Controller('authorization/examples')
export class AuthorizationExampleController {
  @Put('events/:eventId')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, PoliciesGuard)
  @Roles(RoleName.ORGANIZER)
  @Permissions(PermissionName.EVENT_UPDATE)
  @CheckPolicies({
    handler: OrganizerOwnsEventPolicy,
    resourceKey: 'eventResource',
  })
  updateEvent(@Param('eventId') eventId: number, @Body() body: any) {
    return {
      eventId,
      payload: body,
      message: 'Event updated by owner organizer',
    };
  }

  @Get('tickets/:ticketId')
  @UseGuards(JwtAuthGuard, RolesGuard, PoliciesGuard)
  @Roles(RoleName.CUSTOMER)
  @CheckPolicies({
    handler: CustomerOwnsTicketPolicy,
    resourceKey: 'ticketResource',
  })
  getTicket(@Param('ticketId') ticketId: number) {
    return {
      ticketId,
      message: 'Ticket visible to owner customer',
    };
  }

  @Post('tickets/:ticketId/scan')
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard, PoliciesGuard)
  @Roles(RoleName.STAFF)
  @Permissions(PermissionName.TICKET_SCAN)
  @CheckPolicies({
    handler: StaffAssignedEventPolicy,
    resourceKey: 'staffScanResource',
  })
  scanTicket(@Param('ticketId') ticketId: number) {
    return {
      ticketId,
      message: 'Ticket scanned by assigned staff',
    };
  }
}
