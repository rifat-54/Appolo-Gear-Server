export const USER_ROLE = {
  admin: 'admin',
  user: 'user',
  driver: 'driver',
} as const;

export type TUserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];