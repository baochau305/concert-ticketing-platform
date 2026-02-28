import { Injectable, NestMiddleware } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class ResourceContextMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: any, _res: any, next: () => void) {
    const eventIdRaw = req.params?.eventId;
    const ticketIdRaw = req.params?.ticketId;

    if (eventIdRaw) {
      const eventId = Number(eventIdRaw);
      const events = await this.dataSource.query(
        'SELECT id, organizer_id FROM events WHERE id = $1 LIMIT 1',
        [eventId],
      );

      const event = events[0];
      if (event) {
        req.eventResource = {
          id: Number(event.id),
          organizerId: Number(event.organizer_id),
        };
      }
    }

    if (ticketIdRaw) {
      const ticketId = Number(ticketIdRaw);
      const tickets = await this.dataSource.query(
        'SELECT id, customer_id, event_id FROM tickets WHERE id = $1 LIMIT 1',
        [ticketId],
      );

      const ticket = tickets[0];
      if (ticket) {
        req.ticketResource = {
          id: Number(ticket.id),
          customerId: Number(ticket.customer_id),
          eventId: Number(ticket.event_id),
        };

        const assignments = await this.dataSource.query(
          'SELECT user_id FROM event_staff_assignments WHERE event_id = $1',
          [Number(ticket.event_id)],
        );

        req.staffScanResource = {
          ticketId: Number(ticket.id),
          eventId: Number(ticket.event_id),
          assignedStaffIds: assignments.map((item) => Number(item.user_id)),
        };
      }
    }

    next();
  }
}
