/**
 * User roles constants
 */
export const ROLES = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
  PROVIDER: 'service_provider',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

