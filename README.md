# Concert Ticketing Platform

Backend API cho hệ thống đặt vé concert hiệu suất cao (NestJS + PostgreSQL) với mô hình authorization `RBAC + Resource-based policy`.

## 1) RBAC schema + seed

- SQL đầy đủ: `database/rbac-schema.sql`
- Bao gồm các bảng:
  - `users`
  - `roles`
  - `permissions`
  - `role_permissions`
  - `user_roles`
- Có index tối ưu cho lookup role/permission và join table.
- Có seed data cho các role:
  - `CUSTOMER`, `STAFF`, `ORGANIZER`, `ADMIN`, `SUPER_ADMIN`
- Có seed permission string:
  - `event:create`, `event:update`, `ticket:scan`, `user:create`

## 2) JWT authorization (không query role mỗi request)

Luồng hiện tại:

1. Login query 1 lần để lấy user + roles + permissions.
2. Token chứa claim:
   - `userId`
   - `email`
   - `roles[]`
   - `permissions[]`
3. `JwtStrategy` đọc trực tiếp claim từ token, không query DB mỗi request.

File chính:

- `src/auth/auth.service.ts`
- `src/auth/jwt.strategy.ts`
- `src/authorization/roles.guard.ts`
- `src/authorization/permissions.guard.ts`

Ví dụ endpoint đã áp dụng:

- `POST /users`
  - Guard: `JwtAuthGuard + RolesGuard + PermissionsGuard`
  - Chỉ `ADMIN|SUPER_ADMIN` có quyền
  - Cần permission `user:create`

## 3) Resource-based policy (không hard-code trong controller)

Hạ tầng policy:

- `src/authorization/check-policies.decorator.ts`
- `src/authorization/policies.guard.ts`
- `src/authorization/policy.interface.ts`

Policy handlers cụ thể:

- `OrganizerOwnsEventPolicy`
- `CustomerOwnsTicketPolicy`
- `StaffAssignedEventPolicy`

File:

- `src/authorization/policy-handlers.ts`

Resource được preload ngoài controller bằng middleware:

- `src/authorization/resource-context.middleware.ts`

Controller ví dụ:

- `src/authorization/authorization-example.controller.ts`

Routes ví dụ:

- `PUT /authorization/examples/events/:eventId`
  - Chỉ organizer là chủ event mới update được
- `GET /authorization/examples/tickets/:ticketId`
  - Customer chỉ xem ticket của chính họ
- `POST /authorization/examples/tickets/:ticketId/scan`
  - Staff chỉ scan ticket thuộc event họ được phân công

## 4) Vì sao thiết kế này scale tốt

- Không query role/permission ở mọi request: lấy từ JWT claim.
- Lookup resource dựa trên PK/index (`event_id`, `customer_id`, `organizer_id`).
- Mapping many-to-many bằng bảng join nhỏ (`user_roles`, `role_permissions`) dễ cache.
- Không dùng ACL per-ticket (tránh bùng nổ số dòng và query phức tạp).
- Với 100k concurrent users, bottleneck auth giảm vì authorization check chủ yếu in-memory sau khi verify JWT.

## 5) Chạy dự án

```bash
npm install
```

Thiết lập biến môi trường (ví dụ):

```bash
DB_CONNECTION=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=concert_ticketing
JWT_SECRET=change_me
```

Chạy SQL schema + seed:

```bash
psql -U postgres -d concert_ticketing -f database/rbac-schema.sql
```

Chạy app:

```bash
npm run start:dev
```
