import type { AppRole } from '@/lib/auth/roles';

export type ProtectedArea = 'public' | 'monitoringFarmer' | 'monitoringOperator' | 'admin';

const accessMatrix: Record<AppRole, ProtectedArea[]> = {
  GUEST: ['public'],
  FARMER: ['public', 'monitoringFarmer'],
  OPERATOR: ['public', 'monitoringOperator'],
  ADMIN: ['public', 'monitoringFarmer', 'monitoringOperator', 'admin']
};

export function canAccess(role: AppRole, area: ProtectedArea) {
  const currentRole = role ?? 'GUEST';

  return accessMatrix[currentRole]?.includes(area) ?? false;
}