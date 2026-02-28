import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AuthorizationModule } from './authorization.module';
import { AuthorizationExampleController } from './authorization-example.controller';
import { ResourceContextMiddleware } from './resource-context.middleware';

@Module({
  imports: [AuthorizationModule],
  controllers: [AuthorizationExampleController],
  providers: [ResourceContextMiddleware],
})
export class AuthorizationExampleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ResourceContextMiddleware).forRoutes(
      {
        path: 'authorization/examples/events/:eventId',
        method: RequestMethod.PUT,
      },
      {
        path: 'authorization/examples/tickets/:ticketId',
        method: RequestMethod.GET,
      },
      {
        path: 'authorization/examples/tickets/:ticketId/scan',
        method: RequestMethod.POST,
      },
    );
  }
}
