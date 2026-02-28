export const PermissionName = {
  EVENT_CREATE: 'event:create',
  EVENT_UPDATE: 'event:update',
  TICKET_SCAN: 'ticket:scan',
  USER_CREATE: 'user:create',
} as const;

export type PermissionValue =
  (typeof PermissionName)[keyof typeof PermissionName];
