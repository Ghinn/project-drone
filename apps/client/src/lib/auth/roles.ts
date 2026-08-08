export const APP_ROLES = ['GUEST', 'FARMER', 'OPERATOR', 'ADMIN'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export function normalizeRole(value: unknown): AppRole | null {
  if (typeof value !== 'string') {
    return null;
  }

  switch (value.trim().toUpperCase()) {
    case 'GUEST':
      return 'GUEST';
    case 'FARMER':
      return 'FARMER';
    case 'OPERATOR':
      return 'OPERATOR';
    case 'ADMIN':
      return 'ADMIN';
    default:
      return null;
  }
}

export function homeForRole(role: AppRole | null): string {
  if (role === 'ADMIN') {
    return '/admin';
  }
  
  if (role === 'OPERATOR') {
    return '/monitoringOperator';
  }
  
  if (role === 'FARMER') {
    return '/monitoringFarmer';
  }

  return '/';
}

export function redirectForUnauthorized(role: AppRole | null): string {
  return homeForRole(role);
}